import { AppStore } from "@/app/_stores/AppStore"
import { useStore } from "statery"

export default function BuildId() {
  const { buildId } = useStore(AppStore)
  return <div className="w-full text-center text-xs">v{buildId}</div>
}