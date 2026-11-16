import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const MIN_WIDTH = 2;
const MAX_WIDTH = 18;

const PressureCanvas = forwardRef(function PressureCanvas({ color, onPressureChange }, ref) {
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStrokeRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const getPoint = useCallback((event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const pressure = event.pointerType === "mouse" ? 0.5 : Math.max(event.pressure, 0.08);
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      pressure,
    };
  }, []);

  const prepareContext = useCallback((resize = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * ratio);
    const height = Math.round(rect.height * ratio);

    if (resize || canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";
    return { context, rect };
  }, []);

  const drawSegment = useCallback((previous, point, strokeColor) => {
    const prepared = prepareContext();
    if (!prepared) return;
    const { context, rect } = prepared;
    context.beginPath();
    context.moveTo(previous.x * rect.width, previous.y * rect.height);
    context.lineTo(point.x * rect.width, point.y * rect.height);
    context.strokeStyle = strokeColor;
    context.shadowColor = strokeColor;
    context.shadowBlur = 8 + point.pressure * 12;
    context.lineWidth = MIN_WIDTH + point.pressure * (MAX_WIDTH - MIN_WIDTH);
    context.stroke();
  }, [prepareContext]);

  const drawAll = useCallback((resize = false) => {
    const prepared = prepareContext(resize);
    if (!prepared) return;
    const { context, rect } = prepared;
    context.clearRect(0, 0, rect.width, rect.height);

    strokesRef.current.forEach((stroke) => {
      for (let index = 1; index < stroke.points.length; index += 1) {
        const previous = stroke.points[index - 1];
        const point = stroke.points[index];
        context.beginPath();
        context.moveTo(previous.x * rect.width, previous.y * rect.height);
        context.lineTo(point.x * rect.width, point.y * rect.height);
        context.strokeStyle = stroke.color;
        context.shadowColor = stroke.color;
        context.shadowBlur = 8 + point.pressure * 12;
        context.lineWidth = MIN_WIDTH + point.pressure * (MAX_WIDTH - MIN_WIDTH);
        context.stroke();
      }
    });
  }, [prepareContext]);

  useEffect(() => {
    const observer = new ResizeObserver(() => drawAll(true));
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [drawAll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const stopGesture = (event) => event.preventDefault();
    const stopZoomWheel = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };

    canvas.addEventListener("gesturestart", stopGesture, { passive: false });
    canvas.addEventListener("gesturechange", stopGesture, { passive: false });
    canvas.addEventListener("gestureend", stopGesture, { passive: false });
    canvas.addEventListener("wheel", stopZoomWheel, { passive: false });
    return () => {
      canvas.removeEventListener("gesturestart", stopGesture);
      canvas.removeEventListener("gesturechange", stopGesture);
      canvas.removeEventListener("gestureend", stopGesture);
      canvas.removeEventListener("wheel", stopZoomWheel);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    clearCanvas() {
      strokesRef.current = [];
      activeStrokeRef.current = null;
      drawAll();
    },
    exportStrokes: () => strokesRef.current,
    exportImage: () => canvasRef.current.toDataURL("image/png"),
    isEmpty: () => strokesRef.current.length === 0,
  }), [drawAll]);

  const startStroke = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    const stroke = { color, points: [point] };
    strokesRef.current.push(stroke);
    activeStrokeRef.current = stroke;
    setDrawing(true);
    onPressureChange(point.pressure);
  };

  const continueStroke = (event) => {
    if (!activeStrokeRef.current) return;
    event.preventDefault();
    const point = getPoint(event);
    const points = activeStrokeRef.current.points;
    const previous = points[points.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < 0.002) return;
    points.push(point);
    onPressureChange(point.pressure);
    drawSegment(previous, point, activeStrokeRef.current.color);
  };

  const endStroke = () => {
    activeStrokeRef.current = null;
    setDrawing(false);
    onPressureChange(0);
  };

  return (
    <canvas
      ref={canvasRef}
      aria-label="手書き入力エリア"
      onPointerDown={startStroke}
      onPointerMove={continueStroke}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onContextMenu={(event) => event.preventDefault()}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        cursor: drawing ? "grabbing" : "crosshair",
        touchAction: "none",
      }}
    />
  );
});

export default PressureCanvas;
