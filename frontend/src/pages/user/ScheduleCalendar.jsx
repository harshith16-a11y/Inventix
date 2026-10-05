import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StockBadge from '../../components/StockBadge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  ArrowRight,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  Flame,
  Filter,
  X,
  MapPin,
  CalendarCheck
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleCalendar() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getMyShipments();
      setSchedules(data || []);
    } catch (err) {
      console.error('Failed to load schedules', err);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || s.type === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  // Map schedules by date string "YYYY-MM-DD"
  const schedulesByDate = {};
  filteredSchedules.forEach((s) => {
    const dateObj = new Date(s.createdAt);
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    if (!schedulesByDate[dateKey]) {
      schedulesByDate[dateKey] = [];
    }
    schedulesByDate[dateKey].push(s);
  });

  // Calendar cells generation (previous month trailing, current month, next month leading)
  const calendarCells = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({
      dayNumber: dayNum,
      isCurrentMonth: false,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    });
  }

  // Current month days
  const today = new Date();
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === d;

    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      isToday,
      dateString: dateKey,
      items: schedulesByDate[dateKey] || []
    });
  }

  // Leading days from next month
  const totalSlots = Math.ceil(calendarCells.length / 7) * 7;
  const remaining = totalSlots - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateString: `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  const getStatusPill = (status, type) => {
    if (status === 'COMPLETED') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (status === 'DISPATCHED') {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
    if (type === 'PRIORITY') {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Schedule Calendar
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Visualize and track your scheduled material dispatches, deliveries, and priority timelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleToday}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
          >
            Today
          </button>

          <Link
            to="/shipments/create"
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            + New Schedule
          </Link>
        </div>
      </div>

      {/* Filter Toolbar & Calendar Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
            {MONTH_NAMES[month]} <span className="text-violet-600 dark:text-violet-400 font-black">{year}</span>
          </h2>
        </div>

        {/* Status & Priority Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending (Scheduled)</option>
            <option value="DISPATCHED">Dispatched (Transit)</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="ALL">All Queues</option>
            <option value="NORMAL">Standard FIFO</option>
            <option value="PRIORITY">Urgent Priority</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <LoadingSpinner message="Loading your schedule calendar..." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-3">
            {DAY_NAMES.map((day) => (
              <div key={day} className="tracking-wider uppercase text-[11px]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {calendarCells.map((cell, idx) => {
              const hasItems = cell.items && cell.items.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => cell.isCurrentMonth && setSelectedDayDate(cell.dateString)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-300 dark:text-slate-700'
                      : cell.isToday
                      ? 'bg-violet-50/40 dark:bg-violet-950/30'
                      : 'hover:bg-rose-50/30 dark:hover:bg-slate-800/60 cursor-pointer'
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? 'bg-gradient-to-tr from-violet-600 to-rose-500 text-white font-extrabold shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasItems && (
                      <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100/90 dark:bg-violet-950 px-1.5 py-0.2 rounded-full font-mono">
                        {cell.items.length}
                      </span>
                    )}
                  </div>

                  {/* Schedule Pills in Day */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[75px]">
                    {cell.items &&
                      cell.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchedule(item);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border truncate transition-transform hover:scale-[1.02] shadow-2xs ${getStatusPill(
                            item.status,
                            item.type
                          )}`}
                          title={`${item.shipmentId} - ${item.status}`}
                        >
                          <div className="flex items-center gap-1">
                            {item.type === 'PRIORITY' ? (
                              <Flame className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                            ) : (
                              <Clock className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                            )}
                            <span className="font-mono">{item.shipmentId}</span>
                            <span className="text-[9px] opacity-80">· ₹{Number(item.totalValue).toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Empty Slot Subtle Cue */}
                  <div className="h-1"></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-black text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/70 px-2 py-0.5 rounded-lg border border-violet-100 dark:border-violet-900/50">
                  {selectedSchedule.shipmentId}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">Schedule Manifest Details</h3>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Schedule Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(selectedSchedule.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Dispatch Queue</span>
                <span className="font-bold text-violet-700 dark:text-violet-300">
                  {selectedSchedule.type === 'PRIORITY' ? 'Priority Urgency' : 'Normal FIFO Queue'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Status</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedSchedule.status}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Total Order Value</span>
                <span className="font-black text-slate-900 dark:text-white text-sm font-mono">
                  ₹{Number(selectedSchedule.totalValue).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Scheduled Items</span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedSchedule.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.productName}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">₹{Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs"
              >
                Close
              </button>
              <Link
                to={`/my-shipments/${selectedSchedule.id}`}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-violet-500/20 flex items-center gap-1.5"
              >
                <span>Full Tracking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Selected Day Quick Action Modal */}
      {selectedDayDate && !selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Schedule on {selectedDayDate}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Would you like to schedule a new goods dispatch or order for this day?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDayDate(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDayDate(null);
                  navigate('/shipments/create');
                }}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
