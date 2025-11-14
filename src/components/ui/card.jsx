import "../../styles/card.css";

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-2xl shadow p-4 ${className || ""}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div>{children}</div>;
};
