export default function Footer() {
  return (
    <footer className="text-center py-6 mt-16 text-gray-500 text-sm border-t border-gray-200 backdrop-blur-md bg-white/60">
      © {new Date().getFullYear()} <span className="font-semibold text-gray-700">Smart Route Predictor</span> 🚗  
      <br />
      Built with ❤️ using <span className="text-indigo-600 font-medium">Flask</span>,{" "}
      <span className="text-purple-600 font-medium">React</span>, and{" "}
      <span className="text-pink-600 font-medium">Machine Learning</span>.
    </footer>
  );
}