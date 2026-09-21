import { Link } from "react-router-dom";
import { useScrambleHover } from "../hooks/useScrambleHover";

export const ScrambleLink = ({
  text,
  className,
  to,
  href,
  onClick,
  external = false,
  end = null,
  ...rest
}) => {
  const { textRef, onMouseEnter } = useScrambleHover(text);

  if (external) {
    return (
      <a
        className={className}
        href={href}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        {...rest}
      >
        <span ref={textRef}>{text}</span>
        {end}
      </a>
    );
  }

  return (
    <Link
      className={className}
      to={to}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      {...rest}
    >
      <span ref={textRef}>{text}</span>
      {end}
    </Link>
  );
};
