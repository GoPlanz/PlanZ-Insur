"use client"

import * as React from "react"
import { format, getYear, getMonth } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  maxDate?: Date
  minYear?: number
  className?: string
}

const YEARS_TO_SHOW = 80 // 显示从当前年份往前多少年

export function DatePicker({
  date,
  onSelect,
  placeholder = "选择日期",
  disabled = false,
  maxDate = new Date(),
  minYear,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewYear, setViewYear] = React.useState(date ? getYear(date) : getYear(maxDate))
  const [viewMonth, setViewMonth] = React.useState(date ? getMonth(date) : getMonth(maxDate))

  const currentYear = getYear(maxDate)
  const startYear = minYear || currentYear - YEARS_TO_SHOW

  // 生成年份列表
  const years = React.useMemo(() => {
    const list = []
    for (let y = currentYear; y >= startYear; y--) {
      list.push(y)
    }
    return list
  }, [currentYear, startYear])

  // 生成月份列表
  const months = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ]

  // 选择年份
  const handleYearSelect = (year: number) => {
    setViewYear(year)
  }

  // 选择月份
  const handleMonthSelect = (month: number) => {
    setViewMonth(month)
  }

  // 选择具体日期
  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewYear, viewMonth, day)
    if (maxDate && selectedDate > maxDate) {
      return
    }
    onSelect?.(selectedDate)
    setOpen(false)
  }

  // 获取某年某月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // 获取某年某月1日是星期几
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // 生成日历网格
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
    const days = []

    // 填充空白
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-9 w-full" />)
    }

    // 填充日期
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = date &&
        getYear(date) === viewYear &&
        getMonth(date) === viewMonth &&
        date.getDate() === d
      const isToday = maxDate &&
        getYear(maxDate) === viewYear &&
        getMonth(maxDate) === viewMonth &&
        maxDate.getDate() === d
      const isFuture = new Date(viewYear, viewMonth, d) > maxDate

      days.push(
        <button
          key={d}
          onClick={() => handleDateSelect(d)}
          disabled={isFuture}
          className={cn(
            "h-8 w-full sm:h-9 rounded-md text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground touch-manipulation",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
            isToday && "ring-2 ring-ring",
            isFuture && "text-muted-foreground opacity-50 cursor-not-allowed"
          )}
        >
          {d}
        </button>
      )
    }

    return days
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "yyyy年MM月dd日", { locale: zhCN })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 sm:p-3" align="start">
        <div className="space-y-2 sm:space-y-3">
          {/* 年份和月份选择器 */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => setViewMonth(prev => prev === 0 ? 11 : prev - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 flex-1 justify-center">
              {/* 月份选择 */}
              <select
                value={viewMonth}
                onChange={(e) => handleMonthSelect(Number(e.target.value))}
                className="h-8 min-w-[60px] sm:min-w-[70px] rounded-md border border-input bg-background px-1 sm:px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              {/* 年份选择 */}
              <select
                value={viewYear}
                onChange={(e) => handleYearSelect(Number(e.target.value))}
                className="h-8 min-w-[70px] sm:min-w-[80px] rounded-md border border-input bg-background px-1 sm:px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => setViewMonth(prev => prev === 11 ? 0 : prev + 1)}
              disabled={viewYear === currentYear && viewMonth >= getMonth(maxDate)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-xs text-muted-foreground mb-0.5 sm:mb-1">
            <div>日</div>
            <div>一</div>
            <div>二</div>
            <div>三</div>
            <div>四</div>
            <div>五</div>
            <div>六</div>
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {renderCalendar()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
