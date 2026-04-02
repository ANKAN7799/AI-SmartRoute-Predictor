// // MULTI-ROUTE LEGEND 2026
// export default function RouteLegend({ routeCount }) {
//   if (!routeCount || routeCount === 0) return null;

//   return (
//     <div
//       style={{
//         position: 'absolute',
//         bottom: '24px',
//         right: '12px',
//         zIndex: 1000,
//         background: 'rgba(255,255,255,0.95)',
//         borderRadius: '12px',
//         padding: '10px 14px',
//         boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
//         border: '1px solid #e0e7ff',
//         minWidth: '160px',
//         pointerEvents: 'none',
//       }}
//     >
//       <p style={{ fontWeight: '700', fontSize: '12px', color: '#4338ca', marginBottom: '7px' }}>
//         🗺️ Route Legend
//       </p>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
//         <div style={{ width: '28px', height: '4px', background: '#ef4444', borderRadius: '2px' }} />
//         <span style={{ fontSize: '11px', color: '#374151', fontWeight: '600' }}>Most Efficient</span>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//         <div style={{ width: '28px', height: '4px', background: '#22c55e', borderRadius: '2px', opacity: 0.85 }} />
//         <span style={{ fontSize: '11px', color: '#374151' }}>
//           Alternative ({routeCount - 1} route{routeCount - 1 !== 1 ? 's' : ''})
//         </span>
//       </div>
//     </div>
//   );
// }







// NEW CODE 



// MULTI-ROUTE LEGEND 2026
export default function RouteLegend({ routeCount }) {
  if (!routeCount || routeCount === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        right: '12px',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        border: '1px solid #e0e7ff',
        minWidth: '170px',
        pointerEvents: 'none',
      }}
    >
      <p style={{ fontWeight: '700', fontSize: '12px', color: '#4338ca', marginBottom: '7px' }}>
        🗺️ Route Legend
      </p>
      {/* GREEN = most efficient */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <div style={{ width: '28px', height: '4px', background: '#16a34a', borderRadius: '2px' }} />
        <span style={{ fontSize: '11px', color: '#374151', fontWeight: '600' }}>Most Efficient</span>
      </div>
      {/* RED dashed = alternative routes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px', height: '4px', borderRadius: '2px',
          background: 'repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 6px, transparent 6px, transparent 10px)',
        }} />
        <span style={{ fontSize: '11px', color: '#374151' }}>
          Alternative ({routeCount - 1} route{routeCount - 1 !== 1 ? 's' : ''})
        </span>
      </div>
    </div>
  );
}



