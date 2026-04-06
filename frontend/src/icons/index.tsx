import wilvaultLogoUrl from "../assets/wilvault-logo.svg";
import dashboardLogoUrl from "../assets/dashboard-logo.svg";
import transactionLogoUrl from "../assets/transactions-logo.svg";
import budgetLogoUrl from "../assets/budgets-logo.svg";
import reportsLogoUrl from "../assets/reports-logo.svg";
import accountsLogoUrl from "../assets/accounts-logo.svg";

export function WilvaultLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={wilvaultLogoUrl} width={width} height={height} className={className} alt="WilVault Logo" />
}

export function DashboardLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={dashboardLogoUrl} width={width} height={height} className={className} alt="Dashboard Logo" />
}

export function TransactionLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={transactionLogoUrl} width={width} height={height} className={className} alt="Transaction Logo" />
}

export function ReportsLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={reportsLogoUrl} width={width} height={height} className={className} alt="Reports Logo" />
}

export function AccountsLogo({ width, height, className }: { width?: number, height?: number, className?: string }) {
  return <img src={accountsLogoUrl} width={width} height={height} className={className} alt="Accounts Logo" />
}