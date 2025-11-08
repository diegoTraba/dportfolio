// lib/binanceService.ts

/**
 * SERVICIO OPTIMIZADO PARA LA API DE BINANCE
 * 
 * Este servicio se encarga de:
 * 1. Conectar con la API de Binance usando credenciales de usuario
 * 2. Obtener el balance total de Spot y Earn
 * 3. Calcular el valor total en USD de todos los activos
 */

// =============================================================================
// INTERFACES Y TIPOS
// =============================================================================

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface FlexiblePosition {
  asset: string;
  totalAmount: string;
  annualPercentageRate: string;
}

export interface LockedPosition {
  asset: string;
  totalAmount: string;
  positionId: string;
  projectId: string;
}

export interface SimpleEarnAccount {
  totalAmountInBTC?: string;
  totalAmountInUSDT?: string;
  totalFlexibleAmountInBTC?: string;
  totalLockedAmountInBTC?: string;
}

export interface TickerPrice {
  symbol: string;
  price: string;
}

export interface SimpleEarnFlexibleResponse {
  rows: FlexiblePosition[];
  total: number;
}

export interface SimpleEarnLockedResponse {
  rows: LockedPosition[];
  total: number;
}

// =============================================================================
// CLASE PRINCIPAL DEL SERVICIO
// =============================================================================

class BinanceService {
  private baseUrl = "https://api.binance.com";

  // ===========================================================================
  // MÉTODOS PÚBLICOS
  // ===========================================================================

  async testConnection(credentials: BinanceCredentials): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        "/api/v3/account",
        credentials
      );
      return response.ok;
    } catch (error) {
      console.error("Error testing Binance connection:", error);
      return false;
    }
  }

  async getTotalUSDBalance(credentials: BinanceCredentials): Promise<number> {
    try {
      console.log("🚀 Calculando balance total de Binance...");

      // Obtener balances de Spot y Earn en paralelo para mejor rendimiento
      const [spotBalance, earnBalance] = await Promise.all([
        this.getSpotBalance(credentials),
        this.getEarnBalance(credentials)
      ]);

      const totalUSD = spotBalance + earnBalance;

      console.log("🎯 BALANCE TOTAL CALCULADO:", totalUSD.toFixed(2), "USD");
      console.log(`💵 Spot: ${spotBalance.toFixed(2)} USD`);
      console.log(`🏦 Earn: ${earnBalance.toFixed(2)} USD`);

      return parseFloat(totalUSD.toFixed(2));
    } catch (error) {
      console.error("❌ Error calculando balance total:", error);
      throw error;
    }
  }

  // ===========================================================================
  // MÉTODOS PRIVADOS - CÁLCULO DE BALANCES
  // ===========================================================================

  private async getSpotBalance(
    credentials: BinanceCredentials
  ): Promise<number> {
    try {
      // Obtener balances y precios en paralelo
      const [balances, usdtPrices, btcPrice, ethPrice] = await Promise.all([
        this.getAccountBalance(credentials),
        this.getUSDTPrices(),
        this.getBTCPrice(),
        this.getETHPrice()
      ]);

      let spotTotal = 0;

      for (const balance of balances) {
        const asset = balance.asset;
        const totalBalance = parseFloat(balance.free) + parseFloat(balance.locked);

        if (totalBalance === 0) continue;

        // Stablecoins directamente en USD
        if (["USDT", "BUSD", "USDC", "TUSD", "USDP", "DAI", "FDUSD"].includes(asset)) {
          spotTotal += totalBalance;
          continue;
        }

        // Buscar precio en USDT
        if (usdtPrices[asset]) {
          const usdValue = totalBalance * usdtPrices[asset];
          spotTotal += usdValue;
          continue;
        }

        // BTC y ETH como fallback
        if (asset === "BTC" && btcPrice > 0) {
          spotTotal += totalBalance * btcPrice;
          continue;
        }

        if (asset === "ETH" && ethPrice > 0) {
          spotTotal += totalBalance * ethPrice;
          continue;
        }

        console.log(`⚠️ ${asset} spot: Sin par USDT disponible, no incluido`);
      }

      console.log(`💵 BALANCE SPOT TOTAL: ${spotTotal.toFixed(2)} USD`);
      return spotTotal;
    } catch (error) {
      console.error("❌ Error obteniendo balance spot:", error);
      return 0;
    }
  }

  private async getEarnBalance(
    credentials: BinanceCredentials
  ): Promise<number> {
    try {
      console.log("=== 🏦 OBTENIENDO BALANCE EARN ===");

      // Intentar endpoint principal primero (más eficiente)
      const accountResponse = await this.makeAuthenticatedRequest(
        "/sapi/v1/simple-earn/account",
        credentials
      );

      if (accountResponse.ok) {
        const accountData: SimpleEarnAccount = await accountResponse.json();
        console.log("✅ Datos de Simple Earn Account recibidos");

        if (accountData.totalAmountInBTC) {
          const btcAmount = parseFloat(accountData.totalAmountInBTC);
          const btcPrice = await this.getBTCPrice();
          const total = btcAmount * btcPrice;
          console.log(`💰 TOTAL EARN: ${btcAmount} BTC × ${btcPrice} = ${total.toFixed(2)} USD`);
          return total;
        } else if (accountData.totalAmountInUSDT) {
          const total = parseFloat(accountData.totalAmountInUSDT);
          console.log(`💰 TOTAL EARN: ${total} USD`);
          return total;
        }
      }

      // Fallback a endpoints individuales
      console.log("⚠️ Endpoint principal falló, usando endpoints individuales...");
      return await this.getEarnBalanceFromPositions(credentials);
    } catch (error) {
      console.error("❌ Error obteniendo balance earn:", error);
      return 0;
    }
  }

  private async getEarnBalanceFromPositions(
    credentials: BinanceCredentials
  ): Promise<number> {
    try {
      console.log("=== 🔄 USANDO FALLBACK PARA EARN BALANCE ===");

      // Obtener precios y posiciones en paralelo
      const [usdtPrices, flexibleResponse, lockedResponse] = await Promise.all([
        this.getUSDTPrices(),
        this.makeAuthenticatedRequest("/sapi/v1/simple-earn/flexible/position", credentials),
        this.makeAuthenticatedRequest("/sapi/v1/simple-earn/locked/position", credentials)
      ]);

      let totalEarn = 0;

      // Procesar posiciones flexibles
      if (flexibleResponse.ok) {
        const data: SimpleEarnFlexibleResponse = await flexibleResponse.json();
        totalEarn += this.calculateEarnFromPositions(data, "flexible", usdtPrices);
      }

      // Procesar posiciones locked
      if (lockedResponse.ok) {
        const data: SimpleEarnLockedResponse = await lockedResponse.json();
        totalEarn += this.calculateEarnFromPositions(data, "locked", usdtPrices);
      }

      console.log(`🏦 EARN BALANCE TOTAL (fallback): ${totalEarn.toFixed(2)} USD`);
      return totalEarn;
    } catch (error) {
      console.error("❌ Error en fallback de earn balance:", error);
      return 0;
    }
  }

  // ===========================================================================
  // MÉTODOS AUXILIARES
  // ===========================================================================

  private async getAccountBalance(
    credentials: BinanceCredentials
  ): Promise<BinanceBalance[]> {
    const response = await this.makeAuthenticatedRequest(
      "/api/v3/account",
      credentials
    );

    if (!response.ok) {
      throw new Error(`❌ Error de API Binance: ${response.statusText}`);
    }

    const data = await response.json();
    return data.balances.filter(
      (balance: BinanceBalance) =>
        parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );
  }

  private async getUSDTPrices(): Promise<{ [asset: string]: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/price`);
      if (!response.ok) throw new Error("Failed to fetch prices");

      const prices: TickerPrice[] = await response.json();

      const usdtPrices: { [asset: string]: number } = {};

      prices.forEach((price: TickerPrice) => {
        if (price.symbol.endsWith("USDT")) {
          const asset = price.symbol.replace("USDT", "");
          usdtPrices[asset] = parseFloat(price.price);
        }
      });

      console.log(`📊 Obtenidos precios de ${Object.keys(usdtPrices).length} pares USDT`);
      return usdtPrices;
    } catch (error) {
      console.error("❌ Error obteniendo precios USDT:", error);
      return {};
    }
  }

  private async getBTCPrice(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v3/ticker/price?symbol=BTCUSDT`
      );
      if (!response.ok) throw new Error("Failed to fetch BTC price");

      const data: TickerPrice = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error("❌ Error obteniendo precio BTC:", error);
      return 0;
    }
  }

  private async getETHPrice(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v3/ticker/price?symbol=ETHUSDT`
      );
      if (!response.ok) throw new Error("Failed to fetch ETH price");

      const data: TickerPrice = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error("❌ Error obteniendo precio ETH:", error);
      return 0;
    }
  }

  private calculateEarnFromPositions(
    data: SimpleEarnFlexibleResponse | SimpleEarnLockedResponse,
    type: string,
    usdtPrices: { [asset: string]: number }
  ): number {
    try {
      let total = 0;
      const rows = data.rows || [];

      console.log(`📊 Procesando ${rows.length} posiciones de earn (${type})`);

      for (const position of rows) {
        const amountStr = position.totalAmount;
        if (!amountStr) continue;

        const amount = parseFloat(amountStr);
        if (amount > 0 && position.asset) {
          if (["USDT", "BUSD", "USDC"].includes(position.asset)) {
            total += amount;
          } else if (usdtPrices[position.asset]) {
            total += amount * usdtPrices[position.asset];
          } else {
            console.log(`⚠️ ${position.asset} earn: Sin precio disponible, no incluido`);
          }
        }
      }

      return total;
    } catch (error) {
      console.error("❌ Error calculando earn desde posiciones:", error);
      return 0;
    }
  }

  // ===========================================================================
  // MÉTODOS DE AUTENTICACIÓN
  // ===========================================================================

  private async makeAuthenticatedRequest(
    endpoint: string,
    credentials: BinanceCredentials,
    additionalParams: Record<string, string> = {}
  ): Promise<Response> {
    const timestamp = Date.now().toString();
    const params = new URLSearchParams({
      timestamp,
      ...additionalParams,
    });

    const queryString = params.toString();
    const signature = await this.generateSignature(queryString, credentials.apiSecret);

    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      headers: {
        "X-MBX-APIKEY": credentials.apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText} for ${endpoint}`);
    }

    return response;
  }

  private async generateSignature(
    data: string,
    apiSecret: string
  ): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(data)
    );
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export const binanceService = new BinanceService();