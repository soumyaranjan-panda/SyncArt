import React, { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";
import { Socket } from "socket.io-client";

interface DrawingElement {
    type: string;
    offsetX: number;
    offsetY: number;
    path: [number, number][];
    width?: number;
    height?: number;
    stroke: string;
}

interface WhiteboardInput {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    ctxRef: React.MutableRefObject<CanvasRenderingContext2D | null>;
    elements: DrawingElement[];
    setElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
    tool: string;
    color: string;
    addElement: (element: DrawingElement) => void;
    socket: Socket;
    roomId: string;
}

const Whiteboard = ({
    canvasRef,
    ctxRef,
    elements,
    setElements,
    tool,
    color,
    addElement,
    socket,
    roomId,
}: WhiteboardInput) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext("2d");
            ctxRef.current = ctx;
        }

        const handleResize = () => {
            if (canvas) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                redrawCanvas();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [canvasRef, ctxRef]);

    useEffect(() => {
        socket.on("drawElement", (newElement: DrawingElement) => {
            setElements(prevElements => [...prevElements, newElement]);
        });

        return () => {
            socket.off("drawElement");
        };
    }, [socket, setElements]);

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            elements.forEach(element => {
                drawElement(ctx, element);
            });
        }
    };

    useLayoutEffect(() => {
        redrawCanvas();
    }, [elements]);

    const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
        switch (element.type) {
            case "pencil":
                const roughCanvas = rough.canvas(ctx.canvas);
                roughCanvas.linearPath(element.path, { stroke: element.stroke, roughness: 0 });
                break;
            case "line":
                if (element.width && element.height) {
                    const roughCanvas = rough.canvas(ctx.canvas);
                    roughCanvas.line(
                        element.offsetX,
                        element.offsetY,
                        element.offsetX + element.width,
                        element.offsetY + element.height,
                        { stroke: element.stroke }
                    );
                }
                break;
            case "rectangle":
                if (element.width && element.height) {
                    const roughCanvas = rough.canvas(ctx.canvas);
                    roughCanvas.rectangle(
                        element.offsetX,
                        element.offsetY,
                        element.width,
                        element.height,
                        { stroke: element.stroke }
                    );
                }
                break;
            case "eraser":
                ctx.globalCompositeOperation = "destination-out";
                ctx.beginPath();
                for (let i = 0; i < element.path.length - 1; i++) {
                    ctx.moveTo(element.path[i][0], element.path[i][1]);
                    ctx.lineTo(element.path[i+1][0], element.path[i+1][1]);
                }
                ctx.stroke();
                ctx.globalCompositeOperation = "source-over";
                break;
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = e.nativeEvent;
        setIsDrawing(true);

        const newElement: DrawingElement = {
            type: tool,
            offsetX,
            offsetY,
            path: [[offsetX, offsetY]],
            stroke: color,
        };

        setCurrentElement(newElement);
        if (tool !== "eraser") {
            addElement(newElement);
            socket.emit("drawElement", { roomId, element: newElement });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = e.nativeEvent;

        if (currentElement) {
            const updatedElement = { ...currentElement };

            switch (tool) {
                case "pencil":
                case "eraser":
                    updatedElement.path = [...updatedElement.path, [offsetX, offsetY]];
                    break;
                case "line":
                    updatedElement.width = offsetX - updatedElement.offsetX;
                    updatedElement.height = offsetY - updatedElement.offsetY;
                    break;
                case "rectangle":
                    updatedElement.width = offsetX - updatedElement.offsetX;
                    updatedElement.height = offsetY - updatedElement.offsetY;
                    break;
            }

            setCurrentElement(updatedElement);

            if (tool === "eraser") {
                setElements(prevElements => [...prevElements, updatedElement]);
                socket.emit("drawElement", { roomId, element: updatedElement });
            }
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        if (currentElement) {
            addElement(currentElement);
            socket.emit("drawElement", { roomId, element: currentElement });
        }
        setCurrentElement(null);
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full border-2 border-gray-300 rounded-lg"
        />
    );
};

export default Whiteboard;