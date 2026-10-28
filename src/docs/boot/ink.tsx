import * as React from "react";
import { cn } from "@/lib/cn";
import { ENSO, FLOWER, KASURE, PETAL, PETALS, STAMENS } from "../YugenMark";
import { MINCHO } from "./kanji";

// Hình vẽ bằng mực dùng chung cho các phòng thử Yugen Labs (màn chờ, trang trạng thái) — bản React của SVG trong splash.html.

/** Đường tâm nét enso cho mặt nạ mực, như #yb-brush trong splash.html. */
const ENSO_BRUSH = "M31.10 10.94A16.2 16.2 0 1 1 20.63 9.65";
/**
 * Nét cọ thư pháp ở giữa khung (viewBox 0 0 100 18), như .yb-stroke trong splash.html: thân nét dày mỏng theo lực bút, đầu
 * nhấn, đuôi thuôn; khe bút khô (kasure) ở đuôi, sợi lông bút tách ra và vài giọt mực. Sinh một lần rồi ghi cứng — mép gồ ghề
 * nằm sẵn trong hình nên không cần filter lúc chạy.
 */
export const STROKE_BODY = "M5 7.9C5.3 7.8 6.2 7.2 6.9 6.9C7.5 6.5 8.1 6.1 8.7 6C9.3 5.8 9.9 6.1 10.6 6.2C11.2 6.3 11.8 6.5 12.4 6.5C13 6.5 13.7 6.4 14.3 6.4C14.9 6.4 15.5 6.4 16.1 6.4C16.7 6.4 17.4 6.4 18 6.4C18.6 6.3 19.2 6.3 19.8 6.2C20.5 6.2 21.1 6.1 21.7 6.1C22.3 6 22.9 6 23.5 6C24.2 6 24.8 6 25.4 6C26 6 26.6 6 27.3 6C27.9 6 28.5 5.9 29.1 5.9C29.7 5.9 30.3 5.9 31 5.8C31.6 5.8 32.2 5.8 32.8 5.8C33.4 5.7 34 5.7 34.7 5.7C35.3 5.7 35.9 5.7 36.5 5.7C37.1 5.7 37.8 5.6 38.4 5.6C39 5.6 39.6 5.6 40.2 5.5C40.8 5.5 41.5 5.5 42.1 5.5C42.7 5.5 43.3 5.5 43.9 5.5C44.6 5.4 45.2 5.4 45.8 5.4C46.4 5.4 47 5.3 47.6 5.3C48.3 5.3 48.9 5.2 49.5 5.2C50.1 5.2 50.7 5.2 51.4 5.2C52 5.2 52.6 5.2 53.2 5.2C53.8 5.2 54.4 5.2 55.1 5.2C55.7 5.2 56.3 5.2 56.9 5.2C57.5 5.3 58.2 5.3 58.8 5.3C59.4 5.3 60 5.3 60.6 5.3C61.2 5.4 61.9 5.4 62.5 5.5C63.1 5.5 63.7 5.5 64.3 5.6C65 5.6 65.6 5.6 66.2 5.6C66.8 5.7 67.4 5.7 68 5.8C68.7 5.8 69.3 5.9 69.9 6C70.5 6 71.1 6.1 71.8 6.1C72.4 6.2 73 6.2 73.6 6.3C74.2 6.4 74.8 6.4 75.5 6.5C76.1 6.6 76.7 6.7 77.3 6.7C77.9 6.8 78.5 6.9 79.2 6.9C79.8 7 80.4 7.1 81 7.2C81.6 7.2 82.3 7.3 82.9 7.3C83.5 7.4 84.1 7.4 84.7 7.5C85.3 7.6 86 7.6 86.6 7.7C87.2 7.8 87.8 7.8 88.4 7.9C89.1 7.9 89.7 7.9 90.3 7.9C90.9 8 91.5 8 92.1 8C92.8 8.1 93.7 8.1 94 8.1L94 8.4C93.7 8.4 92.8 8.4 92.1 8.4C91.5 8.4 90.9 8.4 90.3 8.4C89.7 8.4 89.1 8.5 88.4 8.5C87.8 8.5 87.2 8.6 86.6 8.6C86 8.7 85.3 8.7 84.7 8.8C84.1 8.9 83.5 8.9 82.9 9C82.3 9.1 81.6 9.1 81 9.2C80.4 9.3 79.8 9.3 79.2 9.4C78.5 9.4 77.9 9.5 77.3 9.5C76.7 9.6 76.1 9.7 75.5 9.7C74.8 9.8 74.2 9.9 73.6 10C73 10.1 72.4 10.2 71.8 10.2C71.1 10.3 70.5 10.3 69.9 10.4C69.3 10.4 68.7 10.5 68 10.6C67.4 10.7 66.8 10.8 66.2 10.8C65.6 10.9 65 10.9 64.3 11C63.7 11.1 63.1 11.1 62.5 11.1C61.9 11.2 61.2 11.2 60.6 11.3C60 11.3 59.4 11.4 58.8 11.4C58.2 11.4 57.5 11.5 56.9 11.5C56.3 11.5 55.7 11.5 55.1 11.5C54.4 11.5 53.8 11.6 53.2 11.6C52.6 11.7 52 11.7 51.4 11.7C50.7 11.7 50.1 11.7 49.5 11.7C48.9 11.7 48.3 11.8 47.6 11.8C47 11.8 46.4 11.8 45.8 11.8C45.2 11.8 44.6 11.8 43.9 11.9C43.3 11.9 42.7 11.9 42.1 12C41.5 12 40.8 12 40.2 12C39.6 12 39 12 38.4 12.1C37.8 12.1 37.1 12.1 36.5 12.2C35.9 12.2 35.3 12.3 34.7 12.3C34 12.3 33.4 12.3 32.8 12.4C32.2 12.4 31.6 12.5 31 12.5C30.3 12.5 29.7 12.6 29.1 12.6C28.5 12.7 27.9 12.7 27.3 12.8C26.6 12.8 26 12.8 25.4 12.9C24.8 12.9 24.2 13 23.5 13C22.9 13.1 22.3 13.1 21.7 13.2C21.1 13.2 20.5 13.2 19.8 13.2C19.2 13.3 18.6 13.3 18 13.4C17.4 13.4 16.7 13.5 16.1 13.6C15.5 13.6 14.9 13.7 14.3 13.7C13.7 13.8 13 13.7 12.4 13.8C11.8 13.9 11.2 14.2 10.6 14.3C9.9 14.4 9.3 14.5 8.7 14.4C8.1 14.2 7.5 13.7 6.9 13.5C6.2 13.3 5.3 13.1 5 13C2.4 13 1.6 9.1 2.8 7.4C3.6 7 4.4 7.6 5 7.9Z";
/** Khe bút khô, khoét vào thân nét (mặt nạ). */
export const STROKE_DRY = "M45.9 6.3C46.7 6.3 49 6.1 50.6 6.1C52.1 6 53.7 6 55.2 5.9C56.7 5.9 58.3 5.9 59.8 6C61.4 6 62.9 6 64.5 6.1C66 6.2 67.5 6.2 69.1 6.3C70.6 6.4 72.2 6.5 73.7 6.6C75.3 6.7 76.8 6.9 78.3 7C79.9 7.2 81.4 7.3 83 7.4C84.5 7.5 86 7.7 87.6 7.8C89.1 7.9 91.4 8 92.2 8.1L92.2 8.1C91.4 8.1 89.1 8 87.6 8C86 7.9 84.5 7.8 83 7.7C81.4 7.6 79.9 7.5 78.3 7.4C76.8 7.3 75.3 7.1 73.7 7C72.2 6.9 70.6 6.8 69.1 6.8C67.5 6.7 66 6.6 64.5 6.5C62.9 6.4 61.4 6.4 59.8 6.3C58.3 6.3 56.7 6.3 55.2 6.2C53.7 6.2 52.1 6.2 50.6 6.2C49 6.2 46.7 6.3 45.9 6.3ZM62 7C62.4 7 63.8 7 64.7 7C65.6 7 66.6 7 67.5 7C68.4 7 69.3 7 70.2 7.1C71.2 7.1 72.1 7.1 73 7.2C73.9 7.2 74.8 7.2 75.8 7.3C76.7 7.3 77.6 7.4 78.5 7.4C79.4 7.5 80.4 7.6 81.3 7.6C82.2 7.6 83.1 7.7 84 7.7C85 7.8 85.9 7.9 86.8 7.9C87.7 8 89.1 8 89.5 8L89.5 8C89.1 8 87.7 8 86.8 8C85.9 8 85 7.9 84 7.9C83.1 7.9 82.2 7.8 81.3 7.8C80.4 7.8 79.4 7.7 78.5 7.7C77.6 7.6 76.7 7.6 75.8 7.5C74.8 7.5 73.9 7.4 73 7.4C72.1 7.3 71.2 7.3 70.2 7.3C69.3 7.2 68.4 7.2 67.5 7.1C66.6 7.1 65.6 7.1 64.7 7.1C63.8 7 62.4 7 62 7ZM54.8 7.7C55.5 7.7 57.5 7.7 58.8 7.6C60.1 7.6 61.4 7.6 62.7 7.6C64 7.6 65.3 7.6 66.6 7.6C67.9 7.6 69.2 7.6 70.5 7.6C71.8 7.6 73.1 7.6 74.4 7.6C75.7 7.7 77 7.7 78.3 7.7C79.6 7.8 80.9 7.8 82.3 7.8C83.6 7.9 84.9 7.9 86.2 8C87.5 8 88.8 8 90.1 8.1C91.4 8.1 93.3 8.2 94 8.2L94 8.2C93.3 8.2 91.4 8.2 90.1 8.2C88.8 8.2 87.5 8.2 86.2 8.2C84.9 8.2 83.6 8.1 82.3 8.1C80.9 8.1 79.6 8.1 78.3 8C77 8 75.7 8 74.4 7.9C73.1 7.9 71.8 7.9 70.5 7.9C69.2 7.9 67.9 7.8 66.6 7.8C65.3 7.8 64 7.8 62.7 7.8C61.4 7.8 60.1 7.8 58.8 7.8C57.5 7.8 55.5 7.7 54.8 7.7ZM38.8 9C39.7 9 42.5 8.8 44.3 8.8C46.2 8.7 48 8.6 49.9 8.6C51.7 8.5 53.5 8.4 55.4 8.4C57.2 8.3 59.1 8.3 60.9 8.3C62.7 8.2 64.6 8.2 66.4 8.2C68.2 8.1 70.1 8.1 71.9 8.1C73.8 8.1 75.6 8.1 77.4 8.1C79.3 8.1 81.1 8.1 83 8.1C84.8 8.1 86.6 8.1 88.5 8.1C90.3 8.1 93.1 8.2 94 8.2L94 8.2C93.1 8.2 90.3 8.3 88.5 8.3C86.6 8.3 84.8 8.3 83 8.3C81.1 8.3 79.3 8.4 77.4 8.4C75.6 8.4 73.8 8.4 71.9 8.5C70.1 8.5 68.2 8.5 66.4 8.5C64.6 8.6 62.7 8.6 60.9 8.6C59.1 8.6 57.2 8.7 55.4 8.7C53.5 8.7 51.7 8.8 49.9 8.8C48 8.8 46.2 8.9 44.3 8.9C42.5 9 39.7 9 38.8 9ZM67.3 8.9C67.7 8.9 68.9 8.8 69.7 8.8C70.5 8.8 71.3 8.7 72.1 8.7C72.9 8.7 73.7 8.6 74.5 8.6C75.3 8.6 76.1 8.5 76.9 8.5C77.7 8.4 78.5 8.4 79.3 8.4C80.1 8.4 80.9 8.4 81.7 8.3C82.5 8.3 83.3 8.3 84.1 8.3C84.9 8.3 85.7 8.3 86.5 8.2C87.3 8.2 88.1 8.2 88.9 8.2C89.7 8.2 90.9 8.2 91.3 8.3L91.3 8.3C90.9 8.3 89.7 8.3 88.9 8.3C88.1 8.3 87.3 8.4 86.5 8.4C85.7 8.4 84.9 8.4 84.1 8.5C83.3 8.5 82.5 8.5 81.7 8.5C80.9 8.6 80.1 8.6 79.3 8.6C78.5 8.6 77.7 8.6 76.9 8.7C76.1 8.7 75.3 8.7 74.5 8.8C73.7 8.8 72.9 8.8 72.1 8.8C71.3 8.9 70.5 8.9 69.7 8.9C68.9 8.9 67.7 8.9 67.3 8.9ZM49.5 10.2C50.1 10.2 52.1 10.1 53.3 10.1C54.6 10 55.9 9.9 57.2 9.9C58.4 9.8 59.7 9.8 61 9.7C62.3 9.6 63.5 9.6 64.8 9.5C66.1 9.4 67.4 9.3 68.6 9.3C69.9 9.2 71.2 9.1 72.5 9.1C73.7 9 75 8.9 76.3 8.8C77.6 8.7 78.8 8.7 80.1 8.6C81.4 8.6 82.7 8.5 83.9 8.5C85.2 8.4 87.1 8.4 87.8 8.4L87.8 8.4C87.1 8.4 85.2 8.5 83.9 8.6C82.7 8.7 81.4 8.8 80.1 8.9C78.8 9 77.6 9 76.3 9.1C75 9.2 73.7 9.3 72.5 9.4C71.2 9.5 69.9 9.6 68.6 9.6C67.4 9.7 66.1 9.8 64.8 9.9C63.5 9.9 62.3 10 61 10C59.7 10.1 58.4 10.1 57.2 10.2C55.9 10.2 54.6 10.2 53.3 10.2C52.1 10.2 50.1 10.2 49.5 10.2ZM58.4 10.8C58.9 10.8 60.3 10.6 61.2 10.6C62.2 10.5 63.1 10.4 64.1 10.4C65 10.3 66 10.2 66.9 10.1C67.9 10 68.8 9.9 69.8 9.8C70.7 9.7 71.7 9.7 72.6 9.6C73.6 9.5 74.5 9.4 75.5 9.3C76.4 9.2 77.4 9.1 78.3 9.1C79.3 9 80.2 9 81.2 8.9C82.1 8.8 83.1 8.7 84 8.7C85 8.6 86.4 8.6 86.9 8.5L86.9 8.5C86.4 8.6 85 8.7 84 8.8C83.1 8.9 82.1 9 81.2 9.1C80.2 9.2 79.3 9.2 78.3 9.3C77.4 9.4 76.4 9.5 75.5 9.5C74.5 9.6 73.6 9.8 72.6 9.9C71.7 10 70.7 10 69.8 10.1C68.8 10.1 67.9 10.3 66.9 10.3C66 10.4 65 10.5 64.1 10.6C63.1 10.6 62.2 10.6 61.2 10.7C60.3 10.7 58.9 10.8 58.4 10.8ZM16.6 11.8C16.9 11.8 17.9 11.7 18.6 11.6C19.3 11.5 20 11.5 20.7 11.4C21.3 11.4 22 11.4 22.7 11.3C23.4 11.3 24.1 11.2 24.8 11.2C25.4 11.1 26.1 11.1 26.8 11C27.5 11 28.2 11 28.9 10.9C29.5 10.9 30.2 10.9 30.9 10.8C31.6 10.8 32.3 10.7 32.9 10.7C33.6 10.7 34.3 10.7 35 10.7C35.7 10.6 36.7 10.6 37 10.6L37 10.6C36.7 10.6 35.7 10.7 35 10.8C34.3 10.8 33.6 10.8 32.9 10.9C32.3 10.9 31.6 11 30.9 11C30.2 11.1 29.5 11.1 28.9 11.1C28.2 11.2 27.5 11.2 26.8 11.3C26.1 11.3 25.4 11.3 24.8 11.4C24.1 11.4 23.4 11.5 22.7 11.5C22 11.5 21.3 11.6 20.7 11.6C20 11.6 19.3 11.7 18.6 11.7C17.9 11.7 16.9 11.8 16.6 11.8ZM26.4 8.2C26.7 8.2 27.5 8.1 28.1 8.1C28.7 8 29.3 8 29.9 8C30.5 7.9 31.1 7.9 31.7 7.9C32.3 7.9 32.9 7.8 33.5 7.8C34.1 7.8 34.7 7.7 35.3 7.7C35.9 7.7 36.4 7.7 37 7.7C37.6 7.7 38.2 7.6 38.8 7.6C39.4 7.6 40 7.6 40.6 7.6C41.2 7.5 41.8 7.5 42.4 7.5C43 7.5 43.9 7.5 44.2 7.5L44.2 7.5C43.9 7.5 43 7.6 42.4 7.6C41.8 7.6 41.2 7.6 40.6 7.7C40 7.7 39.4 7.7 38.8 7.8C38.2 7.8 37.6 7.8 37 7.8C36.4 7.9 35.9 7.9 35.3 7.9C34.7 7.9 34.1 7.9 33.5 8C32.9 8 32.3 8 31.7 8C31.1 8 30.5 8.1 29.9 8.1C29.3 8.1 28.7 8.1 28.1 8.1C27.5 8.2 26.7 8.2 26.4 8.2Z";
export const STROKE_HAIRS = "M53.1 4.7C53.7 4.7 55.4 4.6 56.6 4.6C57.8 4.6 59 4.6 60.2 4.6C61.4 4.6 62.6 4.7 63.7 4.7C64.9 4.8 66.1 4.8 67.3 4.9C68.5 4.9 69.7 5.1 70.9 5.2C72 5.3 73.2 5.4 74.4 5.5C75.6 5.6 76.8 5.8 78 5.9C79.2 6.1 80.4 6.2 81.5 6.3C82.7 6.5 83.9 6.6 85.1 6.7C86.3 6.8 88.1 7.1 88.7 7.1L88.7 7.1C88.1 7.1 86.3 7 85.1 6.9C83.9 6.8 82.7 6.8 81.5 6.7C80.4 6.6 79.2 6.5 78 6.4C76.8 6.2 75.6 6.1 74.4 6C73.2 5.9 72 5.8 70.9 5.7C69.7 5.6 68.5 5.4 67.3 5.4C66.1 5.3 64.9 5.2 63.7 5.2C62.6 5.1 61.4 5 60.2 4.9C59 4.9 57.8 4.9 56.6 4.8C55.4 4.8 53.7 4.7 53.1 4.7ZM67.3 4.4C67.6 4.4 68.5 4.5 69.1 4.5C69.7 4.6 70.3 4.6 70.9 4.6C71.5 4.6 72 4.7 72.6 4.7C73.2 4.8 73.8 4.8 74.4 4.9C75 4.9 75.6 5 76.2 5.1C76.8 5.1 77.4 5.2 78 5.3C78.6 5.3 79.2 5.4 79.8 5.5C80.4 5.5 80.9 5.6 81.5 5.7C82.1 5.7 82.7 5.8 83.3 5.8C83.9 5.9 84.8 6 85.1 6L85.1 6C84.8 6 83.9 6 83.3 6C82.7 5.9 82.1 5.9 81.5 5.9C80.9 5.8 80.4 5.7 79.8 5.7C79.2 5.6 78.6 5.6 78 5.5C77.4 5.5 76.8 5.4 76.2 5.3C75.6 5.3 75 5.2 74.4 5.1C73.8 5.1 73.2 5 72.6 5C72 4.9 71.5 4.8 70.9 4.8C70.3 4.7 69.7 4.7 69.1 4.6C68.5 4.6 67.6 4.5 67.3 4.4ZM58.4 11.9C59 11.8 60.7 11.7 61.9 11.6C63.1 11.5 64.3 11.4 65.4 11.3C66.6 11.1 67.8 11 68.9 10.9C70.1 10.7 71.3 10.7 72.5 10.5C73.6 10.4 74.8 10.2 76 10.1C77.1 10 78.3 9.9 79.5 9.8C80.7 9.7 81.8 9.6 83 9.5C84.2 9.4 85.4 9.3 86.5 9.2C87.7 9.1 88.9 9.1 90 9.1C91.2 9.1 93 9.1 93.6 9.1L93.6 9.1C93 9.2 91.2 9.2 90 9.2C88.9 9.3 87.7 9.4 86.5 9.5C85.4 9.6 84.2 9.7 83 9.8C81.8 9.9 80.7 10 79.5 10.2C78.3 10.3 77.1 10.4 76 10.5C74.8 10.6 73.6 10.8 72.5 10.9C71.3 11 70.1 11.1 68.9 11.2C67.8 11.3 66.6 11.4 65.4 11.5C64.3 11.6 63.1 11.7 61.9 11.8C60.7 11.8 59 11.9 58.4 11.9Z";
/** Giọt mực bắn: [x, y, bán kính]. */
export const STROKE_DOTS: [number, number, number][] = [[2.2, 4.9, 0.55], [3.6, 3.6, 0.22], [1.2, 13.4, 0.3], [8.4, 15.6, 0.24], [30, 3.7, 0.18], [58, 3, 0.26], [73, 13.4, 0.2], [97.6, 4.9, 0.36], [99.6, 8.4, 0.2]];
/** Mép mềm ở đầu mực, theo phần của nét (gradient hiện nét trải từ x = -2 tới 102). */
const SOFT = 0.024;

export const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function PetalGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0" cy="0" r="10" gradientUnits="userSpaceOnUse">
      <stop stopColor="#c02a6f" />
      <stop offset="0.3" stopColor="#ef77a9" />
      <stop offset="0.7" stopColor="#f8bcd4" />
      <stop offset="1" stopColor="#fde8f0" />
    </radialGradient>
  );
}

/** Bông anh đào của logo, mỗi cánh một độ mờ (`petal(i)` 0–1); `grow`: cánh nở từ nhỏ ra. */
export function Blossom({
  transform,
  fill,
  petal,
  heart,
  grow,
}: {
  transform?: string;
  fill: string;
  petal: (i: number) => number;
  heart: boolean;
  grow?: boolean;
}) {
  return (
    <g transform={transform}>
      {PETALS.map(([a, s], i) => {
        const o = petal(i);
        return (
          <path
            key={a}
            d={PETAL}
            transform={`rotate(${a - 8}) scale(${grow ? s * (0.55 + 0.45 * o) : s})`}
            fill={fill}
            stroke="#d9588f"
            strokeOpacity="0.45"
            strokeWidth="0.35"
            opacity={o}
          />
        );
      })}
      <g opacity={heart ? 1 : 0}>
        {STAMENS.map(([x, y], i) => (
          <g key={i}>
            <line x2={x} y2={y} stroke="#b8236a" strokeWidth="0.32" strokeLinecap="round" />
            <circle cx={x} cy={y} r="0.55" fill="#f3b33d" />
          </g>
        ))}
        <circle r="1.1" fill="#b8236a" />
      </g>
    </g>
  );
}

/** Mép nét mực loang nhẹ, như #yb-wet. */
export function WetFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
      <feGaussianBlur stdDeviation="0.3" />
    </filter>
  );
}

/**
 * Logo vẽ bằng mực theo tiến độ `p`: tới 0.9 là mực chạy hết nét, rồi hoa nở từng cánh, đủ 1 thì nhị hiện.
 * `petal` / `heart` thay cách hoa nở theo `p`; `children` vẽ thêm trong cùng hệ toạ độ 48×48 (nhận fill của cánh hoa).
 */
export function InkEnso({
  p,
  reduced,
  blossom = true,
  petal,
  heart,
  className,
  children,
}: {
  p: number;
  reduced: boolean;
  blossom?: boolean;
  petal?: (i: number) => number;
  heart?: boolean;
  className?: string;
  children?: (petalFill: string) => React.ReactNode;
}) {
  const id = React.useId().replace(/:/g, "");
  const ink = clamp(p / 0.9);
  const fill = `url(#${id}p)`;
  return (
    <svg viewBox="0 0 48 48" className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        <WetFilter id={`${id}wet`} />
        <mask id={`${id}draw`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <path
            d={ENSO_BRUSH}
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={reduced ? 0 : 100 - 100 * ink}
            fill="none"
            stroke="#fff"
            strokeWidth="9"
            filter={`url(#${id}wet)`}
          />
        </mask>
        <mask id={`${id}dry`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <rect width="48" height="48" fill="#fff" />
          {KASURE.map((d) => (
            <path key={d} d={d} fill="none" stroke="#000" strokeWidth="0.45" strokeLinecap="round" />
          ))}
        </mask>
        <PetalGradient id={`${id}p`} />
      </defs>
      <g mask={`url(#${id}dry)`} fill="currentColor">
        <path d={ENSO} opacity={0.1} />
        <path d={ENSO} mask={`url(#${id}draw)`} opacity={reduced ? 0.15 + 0.85 * ink : 1} />
      </g>
      {blossom && (
        <Blossom transform={FLOWER} fill={fill} petal={petal ?? ((i) => clamp((p - 0.9 - i * 0.018) / 0.018))} heart={heart ?? p >= 1} />
      )}
      {children?.(fill)}
    </svg>
  );
}

/** Điểm dừng của gradient hiện nét: mỗi đoạn mở cứng ở đầu, mềm ở đầu bút. */
function revealStops(segments: [number, number][]) {
  return segments
    .filter(([a, b]) => b > a)
    .sort((m, n) => m[0] - n[0])
    .flatMap(([a, b]) => [
      { offset: a, on: false },
      { offset: a, on: true },
      { offset: Math.max(a, b - SOFT), on: true },
      { offset: b, on: false },
    ]);
}

/**
 * Nét cọ thư pháp: vệt mờ cả nét + các đoạn mực `segments` (phần của nét theo chiều ngang, 0–1). Chạy từ đầu dòng nên lật ở RTL.
 * Giảm chuyển động: truyền cả nét và hạ `opacity` thay vì cho mực chạy.
 */
export function BrushStroke({ segments, opacity = 1, className }: { segments: [number, number][]; opacity?: number; className?: string }) {
  const id = React.useId().replace(/:/g, "");
  const box = { maskUnits: "userSpaceOnUse", x: -2, y: -2, width: 104, height: 22 } as const;
  return (
    <svg viewBox="0 0 100 18" className={cn("overflow-visible text-foreground-1 rtl:-scale-x-100", className)} aria-hidden>
      <defs>
        <mask id={`${id}dry`} {...box}>
          <rect x="-2" y="-2" width="104" height="22" fill="#fff" />
          <path d={STROKE_DRY} fill="#000" />
        </mask>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="-2" x2="102" y1="0" y2="0">
          {revealStops(segments).map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.on ? "#fff" : "#000"} />
          ))}
        </linearGradient>
        <mask id={`${id}draw`} {...box}>
          <rect x="-2" y="-2" width="104" height="22" fill={`url(#${id}g)`} />
        </mask>
      </defs>
      <path d={STROKE_BODY} fill="currentColor" opacity={0.1} />
      <g fill="currentColor" mask={`url(#${id}draw)`} opacity={opacity}>
        <path d={STROKE_BODY} mask={`url(#${id}dry)`} />
        <path d={STROKE_HAIRS} />
        {STROKE_DOTS.map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Tiến độ chạy liên tục mà không qua state React: vòng rAF ghi `value` và báo cho người nghe, người nghe tự đổi `transform`.
 * React chỉ render lại khi số % đổi — như splash.js.
 */
export interface ProgressSource {
  readonly value: number;
  set(value: number): void;
  subscribe(listener: (value: number) => void): () => void;
}

export function createProgress(): ProgressSource {
  const listeners = new Set<(value: number) => void>();
  let value = 0;
  return {
    get value() {
      return value;
    },
    set(next) {
      value = next;
      listeners.forEach((listener) => listener(next));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

/** Vị trí tấm che của LiveBrushStroke: mép mềm dài 2.5% bề rộng nét, tấm che rộng 110%, đầu mực ở 104·p% (như splash.js). */
const coverAt = (p: number) => `translateX(${(104 * p - 2.5) / 1.1}%)`;

/**
 * Nét cọ chạy theo tiến độ, cùng cách với splash.html: nét vẽ sẵn không đổi, tấm che màu nền trượt sang bằng transform (chạy
 * trên compositor, không phải vẽ lại từng khung hình), vệt mờ của cả nét nằm trên tấm che. Tấm che lấy màu nền của khung
 * (background-1). Giảm chuyển động: không có tấm che, mực đậm dần theo `p` (đổi theo từng %).
 */
export function LiveBrushStroke({ progress, p, reduced, className }: { progress: ProgressSource; p: number; reduced: boolean; className?: string }) {
  const id = React.useId().replace(/:/g, "");
  const cover = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced) return;
    return progress.subscribe((value) => {
      if (cover.current) cover.current.style.transform = coverAt(value);
    });
  }, [progress, reduced]);
  return (
    <div className={cn("relative overflow-hidden text-foreground-1 rtl:-scale-x-100", className)}>
      <svg viewBox="0 0 100 18" className="block w-full" aria-hidden>
        <defs>
          <mask id={`${id}dry`} maskUnits="userSpaceOnUse" x="-2" y="-2" width="104" height="22">
            <rect x="-2" y="-2" width="104" height="22" fill="#fff" />
            <path d={STROKE_DRY} fill="#000" />
          </mask>
        </defs>
        <g fill="currentColor" opacity={reduced ? 0.15 + 0.85 * p : 1}>
          <path d={STROKE_BODY} mask={`url(#${id}dry)`} />
          <path d={STROKE_HAIRS} />
          {STROKE_DOTS.map(([cx, cy, r]) => (
            <circle key={cx} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      </svg>
      {!reduced && (
        <div
          ref={cover}
          className="absolute inset-y-0 left-0 w-[110%] will-change-transform"
          style={{ background: "linear-gradient(to right, transparent, var(--color-background-1) 2.27%)", transform: coverAt(progress.value) }}
        />
      )}
      <svg viewBox="0 0 100 18" className="absolute inset-0 w-full" aria-hidden>
        <path d={STROKE_BODY} fill="currentColor" opacity={0.1} />
      </svg>
    </div>
  );
}

/**
 * Chữ dọc (tategaki) bằng font Mincho. `className` là vị trí và cỡ chữ của khung bọc: với chữ dọc, inset-inline của chính
 * phần tử là trục dọc, nên đặt chỗ ở khung ngang bên ngoài. Khung rộng đúng 1em vì để tự co thì Chrome tính sai bề rộng của
 * chữ dọc trong khung chữ ngang, và chữ tràn ra mép (như .yb-side trong splash.css).
 */
export function Tategaki({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-[1em]", className)}>
      <p className="leading-none font-light text-foreground-3" style={{ fontFamily: MINCHO, writingMode: "vertical-rl" }}>
        {children}
      </p>
    </div>
  );
}
