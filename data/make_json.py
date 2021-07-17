#!/usr/bin/python3

import glob
import json
import re
import sys

REGEX = r"(^\d+). (.*)$"
tables = []

def rollForNum(num):
  if num == 16:
    return "d44"
  if num == 36:
    return "d66"
  if num == 48:
    return "d6d8"
  if num == 64:
    return "d88"
  if num == 216:
    return "d666"
  return f"d{num}"

def parse_file(infile):
  with open(infile, encoding='utf-8') as f:
    entries = []
    first_line = None
    for line in f:
      line = line.strip()
      if not first_line:
        first_line = line
      if line:
        if regex_match := re.search(REGEX, line):
          entries.append({"rowNum": regex_match[1], "tableItem": regex_match[2]})
    table = {
      "name": first_line,
      "category": rollForNum(len(entries)),
      "roll": rollForNum(len(entries)),
      "entries": entries
    }
    tables.append(table)

for infile in glob.glob("*.txt"):
  parse_file(infile)

# sort the tables
tables.sort(key=lambda x: (len(x["entries"]), x["name"]))

with open("tables.json", 'w', encoding='utf-8') as out:
  json.dump(tables, out, indent=2, ensure_ascii=False)
