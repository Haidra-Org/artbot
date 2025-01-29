import { AppStore } from '@/app/_stores/AppStore';
import { useStore } from 'statery';

export default function BuildId() {
  const { buildId } = useStore(AppStore);

  if (!buildId) return null;

  return (
    <div className="w-full text-center text-xs pt-2 font-mono">
      build v.{buildId}
    </div>
  );
}
