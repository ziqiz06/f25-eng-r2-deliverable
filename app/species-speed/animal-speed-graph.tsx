/* eslint-disable */
"use client";

import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { csv } from "d3-fetch";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import { useEffect, useRef, useState } from "react";

type Diet = "carnivore" | "herbivore" | "omnivore";

interface AnimalDatum {
  name: string;
  speed: number;
  diet: Diet;
}

export default function AnimalSpeedGraph() {
  const graphRef = useRef<HTMLDivElement>(null);
  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // Load CSV once
  useEffect(() => {
    (async () => {
      try {
        const rows = await csv("/sample_animals.csv");

        // Adjust keys to match YOUR cleaned CSV columns
        // Recommended cleaned CSV columns: name, speed, diet
        const parsed: AnimalDatum[] = rows
          .map((r) => {
            const name = (r["name"] ?? r["Animal"] ?? "").toString().trim();
            const diet = (r["diet"] ?? r["Diet"] ?? "").toString().trim().toLowerCase() as Diet;
            const speed = Number((r["speed"] ?? r["Average Speed (km/h)"] ?? "").toString().trim());

            return { name, diet, speed };
          })
          .filter(
            (d) =>
              d.name &&
              Number.isFinite(d.speed) &&
              (d.diet === "carnivore" || d.diet === "herbivore" || d.diet === "omnivore"),
          );

        setAnimalData(parsed);
      } catch (e) {
        console.error("Failed to load /sample_animals.csv", e);
        setAnimalData([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!graphRef.current) return;

    graphRef.current.innerHTML = "";
    if (animalData.length === 0) return;

    const container = graphRef.current;

    const containerWidth = container.clientWidth || 900;
    const width = Math.max(containerWidth, 800);
    const height = 520;

    const margin = { top: 60, right: 140, bottom: 60, left: 80 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Create a tooltip div inside the container
    const tooltip = select(container)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("padding", "10px 12px")
      .style("border-radius", "10px")
      .style("font-size", "12px")
      .style("line-height", "1.2")
      .style("background", "rgba(15, 23, 42, 0.92)") // slate-ish
      .style("color", "white")
      .style("box-shadow", "0 10px 25px rgba(0,0,0,0.25)");

    // SVG
    const svg = select(container).append("svg").attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = scaleBand<string>()
      .domain(animalData.map((d) => d.name))
      .range([0, innerW])
      .padding(0.25);

    const yMax = max(animalData, (d) => d.speed) ?? 0;

    const y = scaleLinear().domain([0, yMax]).nice().range([innerH, 0]);

    const color = scaleOrdinal<Diet, string>()
      .domain(["herbivore", "omnivore", "carnivore"])
      .range(["#22c55e", "#f59e0b", "#ef4444"]);

    // Bars
    g.selectAll("rect")
      .data(animalData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.name) ?? 0)
      .attr("y", (d) => y(d.speed))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerH - y(d.speed))
      .attr("rx", 7)
      .attr("fill", (d) => color(d.diet))
      .style("cursor", "pointer")
      .on("mouseenter", function () {
        select(this).attr("opacity", 0.85);
        tooltip.style("opacity", "1");
      })
      .on("mousemove", function (event, d) {
        // event is a MouseEvent
        const rect = container.getBoundingClientRect();

        tooltip
          .html(
            `<div style="font-weight:700; margin-bottom:6px;">${d.name}</div>
             <div><span style="opacity:0.8;">Speed:</span> ${d.speed} km/h</div>
             <div><span style="opacity:0.8;">Diet:</span> ${d.diet}</div>`,
          )
          // position tooltip near mouse, but inside container
          .style("left", `${event.clientX - rect.left + 12}px`)
          .style("top", `${event.clientY - rect.top + 12}px`);
      })
      .on("mouseleave", function () {
        select(this).attr("opacity", 1);
        tooltip.style("opacity", "0");
      });

    // Axes
    // X axis: keep ticks but HIDE labels (so you still get spacing + baseline)
    const xAxis = axisBottom(x).tickFormat(() => "");
    g.append("g").attr("transform", `translate(0,${innerH})`).call(xAxis);

    // Y axis
    g.append("g").call(axisLeft(y).ticks(6));

    // Title
    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", 32)
      .attr("font-size", 18)
      .attr("font-weight", 800)
      .text("Animal Speeds (by diet)");

    // Y label
    svg
      .append("text")
      .attr("transform", `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .text("Speed (km/h)");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left + innerW + 20}, ${margin.top})`);

    const legendItems: Diet[] = ["herbivore", "omnivore", "carnivore"];

    legend
      .selectAll("legend-rect")
      .data(legendItems)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (_, i) => i * 22)
      .attr("width", 14)
      .attr("height", 14)
      .attr("rx", 3)
      .attr("fill", (d) => color(d));

    legend
      .selectAll("legend-text")
      .data(legendItems)
      .enter()
      .append("text")
      .attr("x", 22)
      .attr("y", (_, i) => i * 22 + 11)
      .attr("font-size", 12)
      .attr("alignment-baseline", "middle")
      .text((d) => d);
  }, [animalData]);

  return (
    <div className="w-full">
      {/* IMPORTANT: needs relative so tooltip absolute positions correctly */}
      <div ref={graphRef} className="relative h-[520px] w-full" />
    </div>
  );
}
