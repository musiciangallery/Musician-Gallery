"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ALL_INSTRUMENTS as INSTRUMENTS, ALL_REGIONS as REGIONS } from "@/lib/musicians";

const inputClass =
  "w-full border border-rule bg-w px-4 py-3 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-xs tracking-[0.08em] uppercase text-mid block mb-2";
const hintClass = "text-[11px] text-mid mt-2";

const YEARS_EXPERIENCE = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const LESSON_FORMATS = ["In-person only", "Online Only", "In-person and online"];

const LESSON_LENGTHS = ["30 minutes", "45 minutes", "60 minutes", "75 minutes", "90 minutes"];

const STUDENT_LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

const TRAVEL_OPTIONS = ["Yes - travel costs may apply", "No"];

const AVAILABLE_AS = ["Solo", "Duo", "Trio", "Quartet", "Band"];

const GENRES = [
  "Classical",
  "Country",
  "Folk",
  "Jazz",
