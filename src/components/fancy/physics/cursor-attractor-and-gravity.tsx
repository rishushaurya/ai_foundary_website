"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import Matter from "matter-js";

interface GravityContextType {
  registerBody: (
    id: string,
    element: HTMLElement,
    options?: Matter.IBodyDefinition,
    initialX?: number | string,
    initialY?: number | string
  ) => void;
  unregisterBody: (id: string) => void;
}

const GravityContext = createContext<GravityContextType | null>(null);

export interface GravityProps {
  children: ReactNode;
  className?: string;
  attractorStrength?: number;
  cursorStrength?: number;
  cursorFieldRadius?: number;
  gravity?: { x: number; y: number };
  resetOnResize?: boolean;
}

export default function Gravity({
  children,
  className = "",
  attractorStrength = 0.0,
  cursorStrength = 0.0004,
  cursorFieldRadius = 200,
  gravity = { x: 0, y: 0 },
  resetOnResize = true,
}: GravityProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const bodiesMap = useRef<
    Map<
      string,
      {
        body: Matter.Body;
        element: HTMLElement;
      }
    >
  >(new Map());

  // Initialize Matter Engine & Bounds
  useEffect(() => {
    if (!containerRef.current) return;

    const { Engine, Runner, Bodies, Composite, Events, Vector, Body } = Matter;

    const engine = Engine.create({
      gravity: { x: gravity.x, y: gravity.y, scale: 0.001 },
    });
    engineRef.current = engine;

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    const updateDimensions = () => {
      if (!containerRef.current || !engineRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Remove existing wall boundaries
      const existingWalls = Composite.allBodies(engine.world).filter(
        (b) => (b as any).isWall
      );
      Composite.remove(engine.world, existingWalls);

      // Create boundary walls
      const wallThickness = 100;
      const walls = [
        // Top
        Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, {
          isStatic: true,
          render: { visible: false },
        }),
        // Bottom
        Bodies.rectangle(
          width / 2,
          height + wallThickness / 2,
          width * 2,
          wallThickness,
          { isStatic: true, render: { visible: false } }
        ),
        // Left
        Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, {
          isStatic: true,
          render: { visible: false },
        }),
        // Right
        Bodies.rectangle(
          width + wallThickness / 2,
          height / 2,
          wallThickness,
          height * 2,
          { isStatic: true, render: { visible: false } }
        ),
      ];

      walls.forEach((wall) => {
        (wall as any).isWall = true;
      });

      Composite.add(engine.world, walls);
    };

    updateDimensions();

    // Mouse tracker
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mousePos.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", updateDimensions);

    // Physics Engine Loop: apply cursor attractor forces and sync DOM
    let rafId: number;

    const beforeUpdateHandler = () => {
      const mouse = mousePos.current;
      const bodies = Array.from(bodiesMap.current.values());

      bodies.forEach(({ body }) => {
        // 1. Cursor attractor force
        if (mouse && cursorStrength !== 0) {
          const dx = mouse.x - body.position.x;
          const dy = mouse.y - body.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < cursorFieldRadius && dist > 1) {
            const forceMagnitude = (1 - dist / cursorFieldRadius) * cursorStrength;
            const force = {
              x: (dx / dist) * forceMagnitude * body.mass,
              y: (dy / dist) * forceMagnitude * body.mass,
            };
            Body.applyForce(body, body.position, force);
          }
        }

        // 2. Central Attractor Force (if enabled)
        if (attractorStrength !== 0 && containerRef.current) {
          const cx = containerRef.current.clientWidth / 2;
          const cy = containerRef.current.clientHeight / 2;
          const dx = cx - body.position.x;
          const dy = cy - body.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 1) {
            const force = {
              x: (dx / dist) * attractorStrength * body.mass,
              y: (dy / dist) * attractorStrength * body.mass,
            };
            Body.applyForce(body, body.position, force);
          }
        }
      });
    };

    const syncDOM = () => {
      bodiesMap.current.forEach(({ body, element }) => {
        const x = body.position.x;
        const y = body.position.y;
        const angle = body.angle;

        element.style.transform = `translate3d(${x}px, ${y}px, 0px) translate(-50%, -50%) rotate(${angle}rad)`;
      });

      rafId = requestAnimationFrame(syncDOM);
    };

    Events.on(engine, "beforeUpdate", beforeUpdateHandler);
    rafId = requestAnimationFrame(syncDOM);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", updateDimensions);
      Events.off(engine, "beforeUpdate", beforeUpdateHandler);
      cancelAnimationFrame(rafId);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, [cursorStrength, cursorFieldRadius, attractorStrength, gravity.x, gravity.y]);

  const registerBody = useCallback(
    (
      id: string,
      element: HTMLElement,
      options?: Matter.IBodyDefinition,
      initialX?: number | string,
      initialY?: number | string
    ) => {
      if (!engineRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth || 800;
      const height = containerRef.current.clientHeight || 600;

      let posX = width / 2;
      let posY = height / 2;

      if (typeof initialX === "string" && initialX.endsWith("%")) {
        posX = (parseFloat(initialX) / 100) * width;
      } else if (typeof initialX === "number") {
        posX = initialX;
      }

      if (typeof initialY === "string" && initialY.endsWith("%")) {
        posY = (parseFloat(initialY) / 100) * height;
      } else if (typeof initialY === "number") {
        posY = initialY;
      }

      const rect = element.getBoundingClientRect();
      const radius = Math.max(rect.width, rect.height) / 2 || 12;

      const body = Matter.Bodies.circle(posX, posY, radius, {
        friction: 0.1,
        frictionAir: 0.02,
        restitution: 0.6,
        ...options,
      });

      Matter.Composite.add(engineRef.current.world, body);
      bodiesMap.current.set(id, { body, element });
    },
    []
  );

  const unregisterBody = useCallback((id: string) => {
    if (!engineRef.current) return;
    const entry = bodiesMap.current.get(id);
    if (entry) {
      Matter.Composite.remove(engineRef.current.world, entry.body);
      bodiesMap.current.delete(id);
    }
  }, []);

  return (
    <GravityContext.Provider value={{ registerBody, unregisterBody }}>
      <div
        ref={containerRef}
        className={`relative overflow-hidden pointer-events-none ${className}`}
      >
        {children}
      </div>
    </GravityContext.Provider>
  );
}

export interface MatterBodyProps {
  children: ReactNode;
  matterBodyOptions?: Matter.IBodyDefinition;
  x?: number | string;
  y?: number | string;
  className?: string;
}

export function MatterBody({
  children,
  matterBodyOptions,
  x = "50%",
  y = "50%",
  className = "",
}: MatterBodyProps) {
  const context = useContext(GravityContext);
  const elementRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    if (!context || !elementRef.current) return;
    const currentId = idRef.current;
    const currentEl = elementRef.current;

    context.registerBody(currentId, currentEl, matterBodyOptions, x, y);

    return () => {
      context.unregisterBody(currentId);
    };
  }, [context, matterBodyOptions, x, y]);

  return (
    <div
      ref={elementRef}
      className={`absolute top-0 left-0 will-change-transform pointer-events-auto ${className}`}
      style={{
        transform: "translate3d(-1000px, -1000px, 0)",
      }}
    >
      {children}
    </div>
  );
}
