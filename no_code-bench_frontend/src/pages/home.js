import logo from "./logo.svg";

const Home = () => {
  return (
    <div className="center">
      <img
        src={logo}
        alt="Logo"
        style={{
          width: "auto",
          height: "450px",
          display: "block",
        }}
      />
    </div>
  );
};

export default Home;
