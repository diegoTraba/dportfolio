import { useState, forwardRef, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import { format, getYear, getMonth, setYear, setMonth } from 'date-fns';
import { IconoCalendario, IconoFlechaArriba, IconoFlechaAbajo } from '@/components/controles/Iconos';
import 'react-datepicker/dist/react-datepicker.css';

interface FiltroFechaProps {
  label?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

// Tipos para las props de CustomInput
interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

// Interfaz para los parámetros de renderCustomHeader
interface CustomHeaderProps {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  changeMonth: (month: number) => void;
  changeYear: (year: number) => void;
}

// Componente personalizado para el input
const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    >
      <span className={`${value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        {value || placeholder}
      </span>
      <IconoCalendario className="w-5 h-5 text-gray-400" />
    </button>
  )
);

CustomInput.displayName = 'CustomInput';

const FiltroFecha = ({
  label,
  placeholder = 'Seleccionar fecha',
  value,
  onChange,
  className = '',
  minDate,
  maxDate
}: FiltroFechaProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const [yearRange, setYearRange] = useState<number>(getYear(new Date()));
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (date: Date | null) => {
    if (onChange) {
      onChange(date);
    }
    setIsOpen(false);
    setViewMode('days');
  };

  // Cambiar vista
  const handleViewChange = (newView: 'days' | 'months' | 'years') => {
    setViewMode(newView);
  };

  // Navegación por años
  const years = Array.from({ length: 12 }, (_, i) => yearRange - 1 + i);
  
  const handleYearNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setYearRange(yearRange - 12);
    } else {
      setYearRange(yearRange + 12);
    }
  };

  // Seleccionar año
  const handleYearSelect = (year: number) => {
    if (value) {
      const newDate = setYear(value, year);
      if (onChange) {
        onChange(newDate);
      }
    } else {
      const newDate = setYear(new Date(), year);
      if (onChange) {
        onChange(newDate);
      }
    }
    setViewMode('months');
  };

  // Seleccionar mes
  const handleMonthSelect = (month: number) => {
    if (value) {
      const newDate = setMonth(value, month);
      if (onChange) {
        onChange(newDate);
      }
    } else {
      const currentDate = new Date();
      const newDate = setYear(setMonth(currentDate, month), getYear(currentDate));
      if (onChange) {
        onChange(newDate);
      }
    }
    setViewMode('days');
    setIsOpen(false);
  };

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Meses en español
  const months = [
    { index: 0, name: 'Enero', abbr: 'Ene' },
    { index: 1, name: 'Febrero', abbr: 'Feb' },
    { index: 2, name: 'Marzo', abbr: 'Mar' },
    { index: 3, name: 'Abril', abbr: 'Abr' },
    { index: 4, name: 'Mayo', abbr: 'May' },
    { index: 5, name: 'Junio', abbr: 'Jun' },
    { index: 6, name: 'Julio', abbr: 'Jul' },
    { index: 7, name: 'Agosto', abbr: 'Ago' },
    { index: 8, name: 'Septiembre', abbr: 'Sep' },
    { index: 9, name: 'Octubre', abbr: 'Oct' },
    { index: 10, name: 'Noviembre', abbr: 'Nov' },
    { index: 11, name: 'Diciembre', abbr: 'Dic' }
  ];

  // Renderizar cabecera personalizada - SOLO para vista de días
  const renderCustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: CustomHeaderProps) => {
    const currentYear = getYear(date);
    const currentMonth = getMonth(date);
    const currentMonthName = months[currentMonth].name;

    return (
      <div className="space-y-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        {/* Controles de navegación */}
        <div className="flex items-center justify-between">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            type="button"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewChange('months')}
              className="px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {currentMonthName}
            </button>
            <button
              onClick={() => {
                setYearRange(Math.floor(currentYear / 12) * 12);
                handleViewChange('years');
              }}
              className="px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {currentYear}
            </button>
          </div>
          
          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            type="button"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicador de vista actual */}
        <div className="flex gap-1">
          <button
            onClick={() => handleViewChange('days')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md ${viewMode === 'days' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Días
          </button>
          <button
            onClick={() => handleViewChange('months')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md ${viewMode === 'months' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Meses
          </button>
          <button
            onClick={() => {
              setYearRange(Math.floor(currentYear / 12) * 12);
              handleViewChange('years');
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md ${viewMode === 'years' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Años
          </button>
        </div>
      </div>
    );
  };

  // Renderizar vista de meses
  const renderMonthView = () => {
    const currentYear = value ? getYear(value) : getYear(new Date());

    return (
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {currentYear}
            </h3>
            <button
              onClick={() => handleViewChange('years')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Cambiar año
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => (
            <button
              key={month.index}
              onClick={() => handleMonthSelect(month.index)}
              className="p-3 text-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 border border-transparent transition-all"
            >
              <div className="text-sm font-medium text-gray-800 dark:text-white">
                {month.abbr}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleViewChange('days')}
            className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            ← Volver a vista de días
          </button>
        </div>
      </div>
    );
  };

  // Renderizar vista de años
  const renderYearView = () => {
    const currentYear = value ? getYear(value) : getYear(new Date());

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleYearNavigation('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IconoFlechaAbajo className="w-4 h-4 transform rotate-90" />
          </button>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {years[0]} - {years[years.length - 1]}
          </div>
          <button
            onClick={() => handleYearNavigation('next')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IconoFlechaArriba className="w-4 h-4 transform rotate-90" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className={`p-3 text-center rounded-lg transition-all ${
                year === currentYear
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-white'
              }`}
            >
              <div className="text-sm font-medium">{year}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Años rápidos
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1900, 1950, 2000, new Date().getFullYear()].map((quickYear) => (
              <button
                key={quickYear}
                onClick={() => {
                  handleYearSelect(quickYear);
                  setYearRange(Math.floor(quickYear / 12) * 12);
                }}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {quickYear}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleViewChange('months')}
            className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            ← Volver a vista de meses
          </button>
        </div>
      </div>
    );
  };

  // Renderizar contenido del calendario según la vista
  const renderCalendarContent = () => {
    switch (viewMode) {
      case 'months':
        return renderMonthView();
      case 'years':
        return renderYearView();
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-custom-foreground">
          {label}
        </label>
      )}
      
      <DatePicker
        selected={value}
        onChange={handleChange}
        customInput={<CustomInput placeholder={placeholder} />}
        locale={es}
        dateFormat="dd/MM/yyyy"
        minDate={minDate}
        maxDate={maxDate}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperClassName="!z-50"
        wrapperClassName="w-full"
        open={isOpen}
        onInputClick={() => {
          setIsOpen(true);
          setViewMode('days');
        }}
        onClickOutside={() => {
          setIsOpen(false);
          setViewMode('days');
        }}
        calendarClassName={`!bg-custom-card !border !border-custom-border !rounded-lg !shadow-lg !overflow-hidden ${
          viewMode !== 'days' ? 'min-w-[300px]' : ''
        }`}
        renderCustomHeader={viewMode === 'days' ? renderCustomHeader : undefined}
        renderDayContents={(day, date) => {
          if (!date) return day;
          return (
            <div className="flex items-center justify-center w-full h-full">
              {day}
            </div>
          );
        }}
        dayClassName={(date) => {
          const baseClasses = "hover:bg-custom-surface transition-colors";
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (date.getTime() === today.getTime()) {
            return `${baseClasses} !bg-custom-accent !text-white`;
          }
          
          return baseClasses;
        }}
        monthClassName={() => "hover:bg-custom-surface transition-colors"}
        yearClassName={() => "hover:bg-custom-surface transition-colors"}
        weekDayClassName={() => "text-custom-foreground"}
      >
        {/* Contenido adicional del calendario - SOLO para vistas de meses y años */}
        {renderCalendarContent()}
      </DatePicker>
    </div>
  );
};

export default FiltroFecha;