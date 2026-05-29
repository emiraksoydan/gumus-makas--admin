import CountUp from "react-countup";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Özel format (ör. ₺, %) — verilirse prefix/suffix yerine kullanılır */
  formatFn?: (value: number) => string;
}

/**
 * Sayısal değerleri smooth animasyon ile sayar (0 → value).
 * Değer değiştiğinde önceki değerden yenisine geçer.
 * tr-TR locale formatlaması ile binlik ayraç.
 */
export default function AnimatedNumber({
  value,
  duration = 1.2,
  decimals = 0,
  className,
  prefix,
  suffix,
  formatFn,
}: AnimatedNumberProps) {
  return (
    <CountUp
      end={value}
      duration={duration}
      decimals={decimals}
      separator="."
      decimal=","
      prefix={formatFn ? undefined : prefix}
      suffix={formatFn ? undefined : suffix}
      formattingFn={formatFn}
      preserveValue
      className={className}
    />
  );
}
