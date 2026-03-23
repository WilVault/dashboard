import wilvaultLogoUrl from "../assets/wilvault-logo.svg";

export function WilvaultLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={wilvaultLogoUrl} width={width} height={height} className={className} alt="WilVault Logo" />
}
