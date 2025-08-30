import { RequirePlanAccess } from '../../lib/RequirePlanAccess'

export default function RegularUpdatesPage() {
  return (
    <RequirePlanAccess>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Regular Updates</h1>
        <p className="text-gray-700">
          This is the Regular Updates page where you can find the latest updates and news.
        </p>
      </div>
    </RequirePlanAccess>
  )
}
