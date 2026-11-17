# Teaching simulation / 教学模拟数据

These records were independently generated for Visual Learning Lab. They contain no real students, observations or educational research findings.

本目录数据为本项目独立生成的教学模拟数据，不含真实学生，不代表真实观测或教育研究结论。

- `study-records.csv`: 90 fictional records; id, UTC date, chapter, minutes, score. Four records deliberately contain missing/invalid values. Cleaning retains 86. Hours are derived in the lab as minutes / 60.
- `daily-study.csv`: 90 UTC daily durations, January 1–March 31, 2026. Shared by the time-series and spiral experiments. Distinct from the student-record dataset.
- `study-records.csv`：90 条虚构记录，包含记录编号、UTC 日期、章节、分钟、分数；有意保留 4 条缺失或无效记录，清洗后 86 条。
- `daily-study.csv`：2026 年 1 月 1 日至 3 月 31 日共 90 个 UTC 日期的模拟时长，供时序联动与螺旋实验共用。它与学生记录数据集用途不同。

Reproduce with `npm run data:export`. The app uses the identical deterministic arrays in `src/utils/data.js`; it requires no network data service.

运行 `npm run data:export` 可重建文件。应用使用 `src/utils/data.js` 中完全一致的确定性数组，无需外部数据接口。
