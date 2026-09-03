import {
  TIME_COMPENSATION_SECONDS_OPTIONS,
  type TimeCompensationSeconds,
} from '@/multiplayer'

interface TimeCompensationSelectProps {
  readonly nickname: string
  readonly valueMs: number
  readonly onChange: (seconds: TimeCompensationSeconds) => void
}

function formatSeconds(seconds: number): string {
  return Number.isInteger(seconds) ? String(seconds) : seconds.toFixed(1)
}

export function TimeCompensationSelect({
  nickname,
  valueMs,
  onChange,
}: TimeCompensationSelectProps) {
  return (
    <label className="time-compensation-setting">
      <span>每題計分補償</span>
      <select
        aria-label={`${nickname} 每題時間補償`}
        value={valueMs / 1_000}
        onChange={(event) => onChange(Number(event.target.value) as TimeCompensationSeconds)}
      >
        {TIME_COMPENSATION_SECONDS_OPTIONS.map((seconds) => (
          <option key={seconds} value={seconds}>+{formatSeconds(seconds)} 秒</option>
        ))}
      </select>
    </label>
  )
}
