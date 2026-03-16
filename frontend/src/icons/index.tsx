import wilvaultLogoUrl from "../assets/wilvault-logo.svg";
import googleLogoUrl from "../assets/google.svg";
import githubLogoUrl from "../assets/github.svg";

export function WilvaultLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={wilvaultLogoUrl} width={width} height={height} className={className} alt="WilVault Logo" />
}

export function GoogleLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={googleLogoUrl} width={width} height={height} className={className} alt="Google Logo" />
}

export function GithubLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={githubLogoUrl} width={width} height={height} className={className} alt="GitHub Logo" />
}