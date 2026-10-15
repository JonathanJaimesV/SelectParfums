import { useEffect, useRef, useState } from "react";

/** Reemplaza el IntersectionObserver de app.js: anima el elemento al entrar en pantalla. */
export default function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return (
    <Tag ref={ref} className={`${className} animate-on-scroll${seen ? " is-visible" : ""}`} {...rest}>
      {children}
    </Tag>
  );
}
