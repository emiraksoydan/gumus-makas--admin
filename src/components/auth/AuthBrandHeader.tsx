import { Link } from "react-router";

export default function AuthBrandHeader() {
  return (
    <div className="flex justify-center mb-6">
      <Link to="/" className="flex items-center justify-center">
        <img
          src="/images/logo/gumusmakaslogo.png"
          alt="Gümüş Makas"
          className="w-24 h-24 object-contain animate-auth-logo"
        />
      </Link>
    </div>
  );
}
