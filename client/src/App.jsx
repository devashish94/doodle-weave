import React, { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";
import SelectionLogo from "./assets/SelectionLogo";
import LineLogo from "./assets/LineLogo";
import PencilLogo from "./assets/PencilLogo";
import SquareLogo from "./assets/SquareLogo";
import UndoLogo from "./assets/UndoLogo"
import RedoLogo from "./assets/RedoLogo"
import ProjectName from "./ProjectName";
import DownloadPicture from "./DownloadPicture";
import { useSearchParams } from "react-router-dom";

const generator = rough.generator();

const createElement = (id, x1, y1, x2, y2, type) => {
  switch (type) {
    case "line":
    case "rectangle":
      const roughElement =
        type === "line"
          ? generator.line(x1, y1, x2, y2, {
            roughness: 0
          })
          : generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
            roughness: 0
          });
      return { id, x1, y1, x2, y2, type, roughElement };
    case "pencil":
      return { id, type, points: [{ x: x1, y: y1 }] };
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case "line":
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, "start");
      const end = nearPoint(x, y, x2, y2, "end");
      return start || end || on;
    case "rectangle":
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    case "pencil":
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null;
      });
      return betweenAnyPoint ? "inside" : null;
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x, y, elements) => {
  return elements
    .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
    .find(element => element.position !== null);
};

const adjustElementCoordinates = element => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

const cursorForPosition = position => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null; //should not really get here...
  }
};

function useHistory(initialState) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState = typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex(prevState => prevState + 1);
    }
  };

  function setAllHistory(value) {
    setHistory(value);
    setIndex(value.length - 1);
  }

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);

  return [history[index], setState, undo, redo, history, setAllHistory];
}

const average = (a, b) => (a + b) / 2

function getSvgPathFromStroke(points, closed = true) {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(
    2
  )} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `
  }

  if (closed) {
    result += 'Z'
  }

  return result
}

const drawElement = (roughCanvas, context, element) => {
  switch (element.type) {
    case "line":
    case "rectangle":
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil":
      const stroke = getSvgPathFromStroke(getStroke(element.points, {
        size: 10
      }));
      context.fill(new Path2D(stroke));
      break;
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const adjustmentRequired = type => ["line", "rectangle"].includes(type);

async function sendData(data, canvas) {
  const p = data.map(item => {
    if (item.length > 0) {
      return item.map(({ type, roughElement, ...rest }) => {
        return { type, ...rest }
      })
    }
    return []
  })

  let controller = new AbortController()
  const signal = controller.signal

  const params = new URL(document.location).searchParams

  // const res = await fetch('http://localhost:4000/send-data', {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/send-data`, {
    signal,
    method: 'PUT',
    headers: {
      'Content-Type': "application/json",
    },
    body: JSON.stringify({
      id: params.get("id"),
      history: p,
      picture: canvas.toDataURL()
    })
  })
  const value = await res.json()
  console.log('FROM THE BACKEND', value)
}

const App = () => {
  const [elements, setElements, undo, redo, allHistory, setAllHistory] = useHistory([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("pencil");
  const [selectedElement, setSelectedElement] = useState(null);
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach(element => drawElement(roughCanvas, context, element));
  }, [elements]);

  useEffect(() => {
    function undoRedoFunction(event) {
      if (event.ctrlKey) {
        if (event.key === 'z') {
          undo()
        } else if (event.key === 'y') {
          redo()
        }
      }
    };
    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    let controller = new AbortController()
    const signal = controller.signal

    async function getData() {
      // const res = await fetch(`http://localhost:4000/project/${params.get('id')}`, { signal })
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/project/${params.get('id')}`, { signal })
      if (res.ok) {
        const values = await res.json()
        console.log(values)
        const history = values.history
        console.log('history', history)
        const p = history.map(row => {
          if (row.length > 0) {
            return row.map((element) => {
              const { id, type, x1, y1, x2, y2 } = element
              if (type === "rectangle") {
                return {
                  id, type, x1, y1, x2, y2,
                  roughElement: generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
                    roughness: 0
                  })
                }
              } else if (type === "line") {
                return {
                  id, type, x1, y1, x2, y2,
                  roughElement: generator.line(x1, y1, x2, y2, {
                    roughness: 0
                  })
                }
              }
              return element
            })
          }
          return []
        })
        console.log(p)
        setAllHistory(p)
      } else {
        console.log("fetching project data failed")
        throw new Error('fetching project data failed')
      }
    }
    getData()

    return () => {
      controller.abort()
    }
  }, [])


  const updateElement = (id, x1, y1, x2, y2, type) => {
    const elementsCopy = [...elements];

    switch (type) {
      case "line":
      case "rectangle":
        elementsCopy[id] = createElement(id, x1, y1, x2, y2, type);
        break;
      case "pencil":
        elementsCopy[id].points = [...elementsCopy[id].points, { x: x2, y: y2 }];
        break;
      default:
        throw new Error(`Type not recognised: ${type}`);
    }

    setElements(elementsCopy, true);
  };

  const handleMouseDown = event => {
    const { clientX, clientY } = event;
    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        if (element.type === "pencil") {
          const xOffsets = element.points.map(point => clientX - point.x);
          const yOffsets = element.points.map(point => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements(prevState => prevState);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      setElements(prevState => [...prevState, element]);
      setSelectedElement(element);

      setAction("drawing");
    }
  };

  const handleMouseMove = event => {
    const { clientX, clientY } = event;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      event.target.style.cursor = element ? cursorForPosition(element.position) : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type);
      }
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position, coordinates);
      updateElement(id, x1, y1, x2, y2, type);
    }
  };

  const handleMouseUp = () => {
    if (selectedElement) {
      const index = selectedElement.id;
      const { id, type } = elements[index];
      if ((action === "drawing" || action === "resizing") && adjustmentRequired(type)) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
    }
    setAction("none");
    setSelectedElement(null);
    sendData(allHistory, canvas)
  };

  return (
    <>
      <ProjectName id={params.get("id")} />
      <div className="absolute top-1/2 bottom-1/2 -translate-y-1/2 left-7 rounded-lg w-fit h-fit py-2 px-3 flex flex-col gap-5 bg-black text-white shadow-md">
        <button className={`w-fit ${tool === 'selection' ? 'bg-violet-300 text-black' : 'hover:bg-violet-300 active:bg-violet-400 hover:text-black'} p-2 rounded-md`} onClick={() => setTool("selection")}>
          <SelectionLogo className={`w-6`} />
        </button>
        <button className={`w-fit ${tool === 'line' ? 'bg-violet-300 text-black' : 'hover:bg-violet-300 active:bg-violet-400 hover:text-black'} p-2 rounded-md`} onClick={() => setTool("line")}>
          <LineLogo className={`w-6`} />
        </button>
        <button className={`w-fit ${tool === 'rectangle' ? 'bg-violet-300 text-black' : 'hover:bg-violet-300 active:bg-violet-400 hover:text-black'} p-2 rounded-md`} onClick={() => setTool("rectangle")}>
          <SquareLogo className={`w-6`} />
        </button>
        <button className={`w-fit ${tool === 'pencil' ? 'bg-violet-300 text-black' : 'hover:bg-violet-300 active:bg-violet-400 hover:text-black'} p-2 rounded-md`} onClick={() => setTool("pencil")}>
          <PencilLogo className={`w-6`} />
        </button>
      </div>

      <div className="flex gap-2 fixed bottom-7 left-7 bg-black text-white p-2 rounded-lg shadow-md">
        <button onClick={undo} className="w-fit hover:bg-violet-300 active:bg-violet-400 hover:text-black p-2 rounded-md">
          <UndoLogo className={`w-6`} />
        </button>
        <button onClick={redo} className="w-fit hover:bg-violet-300 active:bg-violet-400 hover:text-black p-2 rounded-md">
          <RedoLogo className={`w-6`} />
        </button>
      </div>

      <DownloadPicture />

      <canvas
        className="bg-neutral-100"
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        Canvas
      </canvas>
    </>
  );
};

export default App;
