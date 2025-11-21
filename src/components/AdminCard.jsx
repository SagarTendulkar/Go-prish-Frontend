import { Link } from "react-router-dom";

const AdminCard = ({ title, value, color, to }) => {
  return (
    <Link
      to={to}
      className={`${color} p-6 rounded-2xl shadow-card transition transform hover:-translate-y-1 hover:shadow-lg cursor-pointer block`}
    >
      <h3 className="text-lg font-medium opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </Link>
  );
};

export default AdminCard;
