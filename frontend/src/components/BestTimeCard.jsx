// Converts "07:00" → "7:00 AM", "21:00" → "9:00 PM"
function formatTime12h(timeStr) {
  if (!timeStr) return timeStr;
  const [hourStr, minute] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return timeStr;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

export default function BestTimeCard({ data }) {
  if (!data) return null;

  // Use ALL times — never slice — so best time always appears in the grid
  const allTimes = data.times || [];

  return (
    <div className="max-w-xl mx-auto mt-6 bg-white p-5 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-indigo-600 mb-3">
        📊 Best Time to Leave
      </h3>

      <p className="mb-3 text-green-600 font-semibold">
        🏆 Best Time:{' '}
        <span className="text-green-700 underline underline-offset-2">
          {formatTime12h(data.best.time)}
        </span>{' '}
        ({data.best.delay} min delay)
      </p>

      <div className="grid grid-cols-3 gap-2 text-sm">
        {allTimes.map((t, i) => {
          const isBest = t.time === data.best.time;
          return (
            <div
              key={i}
              className={`p-2 rounded flex flex-col items-center ${
                isBest
                  ? 'bg-green-100 border-2 border-green-500 font-bold text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="font-semibold">{formatTime12h(t.time)}</span>
              <span className="text-xs text-gray-500">→ {t.delay} min</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}










