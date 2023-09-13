'use client'

import React, { useEffect } from "react";
import * as d3 from 'd3'

import {Timeline} from '../components'

const getNodes = () => {
  const arr = [];
  for (let i = 0; i < 10; i++) {
    const start = Math.random() * 1000;
    const end = start + Math.random() * 1000;
    const id = `node-${i}`;
    arr.push({ interval: { start, end }, id });
  }
  return arr;
}

export default function Home() {

  return (
    <Timeline nodes={getNodes()}/>
  )
}
