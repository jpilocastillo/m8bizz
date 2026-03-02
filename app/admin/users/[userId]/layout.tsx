import { ViewAsLayoutClient } from "./layout-client"

export default function ViewAsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ViewAsLayoutClient>{children}</ViewAsLayoutClient>
}
