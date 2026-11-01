import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { addDays, addMonths, daysBetween, endOfMonth, formatDate, isISO, parseDate, startOfWeek, weekday } from "./dates.js";

// Saturday, 31 Oct 2026.
const T = "2026-10-31";

describe("date math", () => {
  test("weekday", () => {
    assert.equal(weekday(T), 6);
    assert.equal(weekday("2026-11-02"), 1);
  });
  test("addDays crosses month and year", () => {
    assert.equal(addDays(T, 1), "2026-11-01");
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  });
  test("addMonths clamps the day", () => {
    assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
    assert.equal(addMonths("2026-12-15", 1), "2027-01-15");
    assert.equal(addMonths("2026-01-15", -2), "2025-11-15");
  });
  test("daysBetween, startOfWeek, endOfMonth", () => {
    assert.equal(daysBetween("2026-10-31", "2026-11-05"), 5);
    assert.equal(startOfWeek(T), "2026-10-26");
    assert.equal(endOfMonth("2026-02-10"), "2026-02-28");
  });
  test("isISO rejects impossible dates", () => {
    assert.equal(isISO("2026-02-30"), false);
    assert.equal(isISO("2026-11-05"), true);
  });
});

describe("parseDate", () => {
  const p = (s) => parseDate(s, T);
  test("keywords", () => {
    assert.equal(p("today"), T);
    assert.equal(p("tom"), "2026-11-01");
    assert.equal(p("yesterday"), "2026-10-30");
  });
  test("weekday is the next occurrence strictly after today", () => {
    assert.equal(p("sat"), "2026-11-07"); // today is Saturday
    assert.equal(p("mon"), "2026-11-02");
    assert.equal(p("friday"), "2026-11-06");
  });
  test("next <weekday> is the one in next calendar week", () => {
    assert.equal(p("next mon"), "2026-11-02");
    assert.equal(p("next fri"), "2026-11-06");
    assert.equal(parseDate("next mon", "2026-11-02"), "2026-11-09");
  });
  test("offsets", () => {
    assert.equal(p("+3d"), "2026-11-03");
    assert.equal(p("2w"), "2026-11-14");
    assert.equal(p("in 3 days"), "2026-11-03");
    assert.equal(p("+1m"), "2026-11-30");
  });
  test("end of week / month", () => {
    assert.equal(p("eow"), "2026-11-06");
    assert.equal(parseDate("eow", "2026-11-06"), "2026-11-06"); // Friday stays
    assert.equal(p("eom"), "2026-10-31");
    assert.equal(p("nextweek"), "2026-11-02");
  });
  test("absolute forms", () => {
    assert.equal(p("2027-01-02"), "2027-01-02");
    assert.equal(p("11/5"), "2026-11-05");
    assert.equal(p("10/1"), "2027-10-01"); // already past this year
    assert.equal(p("11/5/27"), "2027-11-05");
    assert.equal(p("nov 5"), "2026-11-05");
    assert.equal(p("5 nov"), "2026-11-05");
    assert.equal(p("december 25 2027"), "2027-12-25");
  });
  test("clear and invalid", () => {
    assert.equal(p("none"), "");
    assert.equal(p("-"), "");
    assert.equal(p("banana"), null);
    assert.equal(p(""), null);
    assert.equal(p("2/30"), null);
  });
});

describe("formatDate", () => {
  test("relative labels", () => {
    assert.equal(formatDate(T, T), "Today");
    assert.equal(formatDate("2026-11-01", T), "Tomorrow");
    assert.equal(formatDate("2026-10-30", T), "Yesterday");
    assert.equal(formatDate("2026-11-04", T), "Wed");
    assert.equal(formatDate("2026-11-20", T), "Nov 20");
    assert.equal(formatDate("2027-01-03", T), "Jan 3 2027");
  });
});
