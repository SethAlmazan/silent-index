import { NextRequest, NextResponse } from "next/server";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type RecordData = Record<string, unknown>;

function pick(record: RecordData, ...keys: string[]) {
  for (const key of keys) {
    if (
      record?.[key] !== undefined &&
      record?.[key] !== null &&
      record?.[key] !== ""
    ) {
      return String(record[key]);
    }
  }
  return "";
}

function getStringArray(record: RecordData, key: string) {
  const value = record[key];

  if (Array.isArray(value)) {
    return value.map(String);
  }

  return [];
}

function formatDate(value?: string | Date | null) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function addYears(date: Date, years: number) {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}

function ordinal(day: number) {
  if (day > 3 && day < 21) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function text(
  value: string,
  options?: {
    bold?: boolean;
    size?: number;
    color?: string;
    italics?: boolean;
  },
) {
  return new TextRun({
    text: value,
    bold: options?.bold,
    size: options?.size ?? 22,
    color: options?.color,
    italics: options?.italics,
    font: "Arial",
  });
}

function paragraph(
  children: TextRun[],
  options?: {
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
    spacingBefore?: number;
    indentLeft?: number;
  },
) {
  return new Paragraph({
    children,
    alignment: options?.alignment,
    spacing: {
      before: options?.spacingBefore ?? 0,
      after: options?.spacingAfter ?? 80,
      line: 240,
    },
    indent: {
      left: options?.indentLeft ?? 0,
    },
  });
}

function noBorder() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
}

const ROW_WIDTH = 7600;
const BULLET_COL = 350;
const LABEL_COL = 3400;
const COLON_COL = 250;
const VALUE_COL = 3600;

function fieldRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: BULLET_COL, type: WidthType.DXA },
        borders: noBorder(),
        children: [paragraph([text("")], { spacingAfter: 0 })],
      }),
      new TableCell({
        width: { size: LABEL_COL, type: WidthType.DXA },
        borders: noBorder(),
        children: [
          paragraph([text(label, { bold: true })], { spacingAfter: 0 }),
        ],
      }),
      new TableCell({
        width: { size: COLON_COL, type: WidthType.DXA },
        borders: noBorder(),
        children: [paragraph([text(":", { bold: true })], { spacingAfter: 0 })],
      }),
      new TableCell({
        width: { size: VALUE_COL, type: WidthType.DXA },
        borders: noBorder(),
        children: [
          paragraph([text(value || "N/A", { bold: true })], {
            spacingAfter: 100,
          }),
        ],
      }),
    ],
  });
}

function bulletRow(label: string, value: string) {
  return new Table({
    width: { size: ROW_WIDTH, type: WidthType.DXA },
    borders: noBorder(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: BULLET_COL, type: WidthType.DXA },
            borders: noBorder(),
            children: [
              paragraph([text("•", { bold: true })], { spacingAfter: 0 }),
            ],
          }),
          new TableCell({
            width: { size: LABEL_COL, type: WidthType.DXA },
            borders: noBorder(),
            children: [
              paragraph([text(label, { bold: true })], { spacingAfter: 0 }),
            ],
          }),
          new TableCell({
            width: { size: COLON_COL, type: WidthType.DXA },
            borders: noBorder(),
            children: [
              paragraph([text(":", { bold: true })], { spacingAfter: 0 }),
            ],
          }),
          new TableCell({
            width: { size: VALUE_COL, type: WidthType.DXA },
            borders: noBorder(),
            children: [
              paragraph([text(value || "N/A", { bold: true })], {
                spacingAfter: 0,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

async function imageUrlToBuffer(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const arrayBuffer = await response.arrayBuffer();

  let type: "jpg" | "png" = "jpg";

  if (contentType.includes("png")) {
    type = "png";
  }

  return {
    data: Buffer.from(arrayBuffer),
    type,
  };
}

async function getLogoBuffer() {
  const possiblePaths = [
    path.join(process.cwd(), "public", "denr.png"),
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "public", "chainventory-logo.png"),
  ];

  for (const logoPath of possiblePaths) {
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record: RecordData = body.record;

    if (!record) {
      return NextResponse.json(
        { error: "Missing record data" },
        { status: 400 },
      );
    }

    const exportDate = new Date();
    const exportedDateText = formatDate(pick(record, "registration_date"));
    const expiryDateText = formatDate(
      pick(record, "expiry_date", "expiration_date", "permit_expiry_date") ||
        addYears(exportDate, 2),
    );

    const ownerName = pick(
      record,
      "owner_name",
      "name",
      "full_name",
      "applicant_name",
    );

    const barangay = pick(record, "barangay", "brgy");
    const municipality = pick(record, "municipality", "city");

    const address = [barangay, municipality, "Eastern Samar"]
      .filter(Boolean)
      .join(", ");

    const registrationNo = pick(
      record,
      "registration_no",
      "registration_number",
      "permit_no",
      "permit_number",
    );

    const brand = pick(record, "brand");
    const model = pick(record, "model");
    const quantity = pick(record, "quantity") || "1 unit";
    const horsepower = pick(
      record,
      "power_rating",
      "horsepower",
      "horse_power",
      "hp",
    );

    const guideBar = pick(
      record,
      "length_of_chainsaw",
      "guide_bar_length",
      "max_length_guide_bar",
      "max_guide_bar_length",
    );
    const engineSerial = pick(
      record,
      "engine_serial",
      "engine_serial_number",
      "serial_no",
      "serial_number",
    );
    const origin = pick(record, "country_origin_source");
    const acquisitionDate = formatDate(
      pick(record, "date_manufactured", "year_manufactured"),
    );
    const purchasePrice = pick(record, "purchase_price_selling_price");
    const purpose = pick(record, "purpose");
    const areaUsed = pick(record, "area_location_used");

    const inspectionImages: string[] = getStringArray(
      record,
      "inspection_images",
    );

    const logoBuffer = await getLogoBuffer();

    const imageRuns = [];

    for (const imageUrl of inspectionImages.slice(0, 4)) {
      const image = await imageUrlToBuffer(String(imageUrl));

      if (image) {
        imageRuns.push(
          new ImageRun({
            type: image.type,
            data: image.data,
            transformation: {
              width: 230,
              height: 170,
            },
          }),
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 900,
                bottom: 720,
                left: 900,
              },
            },
          },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: noBorder(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 1200, type: WidthType.DXA },
                      borders: noBorder(),
                      children: logoBuffer
                        ? [
                            new Paragraph({
                              children: [
                                new ImageRun({
                                  type: "png",
                                  data: logoBuffer,
                                  transformation: {
                                    width: 70,
                                    height: 70,
                                  },
                                }),
                              ],
                            }),
                          ]
                        : [paragraph([text("")])],
                    }),
                    new TableCell({
                      borders: noBorder(),
                      children: [
                        paragraph(
                          [text("Republic of the Philippines", { size: 22 })],
                          { spacingAfter: 0 },
                        ),
                        paragraph(
                          [
                            text(
                              "Department of Environment and Natural Resources",
                              { size: 22 },
                            ),
                          ],
                          { spacingAfter: 0 },
                        ),
                        paragraph(
                          [
                            text(
                              "COMMUNITY ENVIRONMENT AND NATURAL RESOURCES",
                              {
                                size: 22,
                                bold: true,
                                color: "2F7D32",
                              },
                            ),
                          ],
                          { spacingAfter: 0 },
                        ),
                        paragraph(
                          [text("Dolores, Eastern Samar", { size: 22 })],
                          { spacingAfter: 500 },
                        ),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            paragraph(
              [
                text("PERMIT TO OWN, POSSESS & USE A CHAINSAW", {
                  bold: true,
                  size: 26,
                }),
              ],
              {
                alignment: AlignmentType.CENTER,
                spacingAfter: 500,
              },
            ),

            paragraph(
              [
                text(
                  "Pursuant to the provisions of DENR Administrative Order No. 2003-24 Series of 2003 which provides the “Implementing Guidelines of the Chainsaw Act of 2002 (R.A No. 9175)” entitled “An act regulating the possession, ownership, sale, importation and use of chainsaw penalizing violations thereof and for other related purpose,” this PERMIT TO OWN, POSSESS AND USE, is hereby issued to:",
                ),
              ],
              {
                alignment: AlignmentType.JUSTIFIED,
                spacingAfter: 240,
              },
            ),

            new Table({
              width: { size: ROW_WIDTH, type: WidthType.DXA },
              borders: noBorder(),
              rows: [
                fieldRow("NAME", ownerName),
                fieldRow("ADDRESS", address),
                fieldRow("REGISTRATION NO.", registrationNo),
              ],
            }),

            paragraph(
              [
                text(
                  "The following information and description of the chainsaws subject of this permit are hereunder enumerated.",
                ),
              ],
              {
                spacingAfter: 240,
              },
            ),

            bulletRow("Quantity", quantity),
            bulletRow("Brand", brand),
            bulletRow("Model", model),
            bulletRow("Horse power", horsepower),
            bulletRow("Max. Length of guide bar", guideBar),
            bulletRow("Engine Serial #", engineSerial),
            bulletRow("Country of Origin/source", origin),
            bulletRow("Date of Acquisition", acquisitionDate),
            bulletRow("Purchase Price/Selling Price", purchasePrice),
            bulletRow("Purpose", purpose),
            paragraph([text("with approved cutting permit.", { bold: true })], {
              alignment: AlignmentType.CENTER,
              spacingAfter: 500,
            }),
            bulletRow("Area/Location the chainsaw will be used", areaUsed),

            paragraph([text("")], { spacingAfter: 240 }),

            paragraph(
              [
                text(
                  `Issued on        : ${exportedDateText} at Dolores, Eastern Samar`,
                ),
              ],
              {
                spacingAfter: 0,
              },
            ),
            paragraph([text(`Expiry Date     : ${expiryDateText}`)], {
              spacingAfter: 500,
            }),
            paragraph([text("Approved by:")], {
              spacingAfter: 300,
            }),

            paragraph([text("SALVACION A. FACTOR, RPF", { bold: true })], {
              spacingAfter: 0,
            }),
            paragraph([text("OIC, CENR Officer")], {
              spacingAfter: 300,
            }),

            paragraph([text("Note:", { bold: true })], {
              spacingAfter: 100,
            }),

            paragraph(
              [
                text(
                  "* The use of chainsaw other than what is herein indicated as its purpose will be a ground for REVOCATION of the CERTIFICATE OF REGISTRATION and shall be penalized in accordance with Section 12 of DAO 2004-23",
                  { bold: true },
                ),
              ],
              {
                alignment: AlignmentType.CENTER,
                spacingAfter: 240,
              },
            ),

            paragraph(
              [
                text(
                  "* Chainsaws subject to Judicial/Administrative confiscation:",
                  { bold: true },
                ),
              ],
              {
                spacingAfter: 80,
              },
            ),

            paragraph(
              [
                text(
                  "1. Chainsaw sold, purchased, re-sold, transferred, distributed, leased, rented, lent or possessed without proper permit/authority from the DENR;",
                  { bold: true },
                ),
              ],
              {
                indentLeft: 400,
                spacingAfter: 80,
              },
            ),

            new Paragraph({
              children: [new PageBreak()],
            }),

            paragraph(
              [
                text(
                  "2. Chainsaws possessed and actually used to cut trees and timber/CANCELLED in forest land or elsewhere without valid Certificate of Registration;",
                  { bold: true },
                ),
              ],
              {
                indentLeft: 400,
                spacingAfter: 80,
              },
            ),

            paragraph(
              [
                text(
                  "3. Chainsaws used as a tool or implement in cutting, gathering, collecting, removing, and/or processing timber or forest products without legal documents",
                  { bold: true },
                ),
              ],
              {
                indentLeft: 400,
                spacingAfter: 360,
              },
            ),

            imageRuns.length > 0
              ? new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: noBorder(),
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          borders: noBorder(),
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: imageRuns[0]
                                ? [imageRuns[0]]
                                : [text("")],
                            }),
                          ],
                        }),
                        new TableCell({
                          borders: noBorder(),
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: imageRuns[1]
                                ? [imageRuns[1]]
                                : [text("")],
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableRow({
                      children: [
                        new TableCell({
                          borders: noBorder(),
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: imageRuns[2]
                                ? [imageRuns[2]]
                                : [text("")],
                            }),
                          ],
                        }),
                        new TableCell({
                          borders: noBorder(),
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: imageRuns[3]
                                ? [imageRuns[3]]
                                : [text("")],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                })
              : paragraph(
                  [text("No inspection images available.", { italics: true })],
                  {
                    alignment: AlignmentType.CENTER,
                    spacingAfter: 500,
                  },
                ),
            
            paragraph([text("")], { spacingAfter: 300 }),    
            paragraph(
              [
                text(
                  `The picture above shown was the actual chainsaw of Mr./Ms. ${ownerName || "N/A"} of ${address || "N/A"} inspected by personnel of this office applied for Certificate of Registration.`,
                ),
              ],
              {
                alignment: AlignmentType.JUSTIFIED,
                spacingAfter: 400,
              },
            ),

            paragraph(
              [
                text(
                  `Done this ${ordinal(exportDate.getDate())} day of ${new Intl.DateTimeFormat(
                    "en-US",
                    {
                      month: "long",
                    },
                  ).format(
                    exportDate,
                  )}, ${exportDate.getFullYear()} at DENR-CENRO, Dolores, Eastern Samar.`,
                ),
              ],
              {
                spacingAfter: 400,
              },
            ),

            paragraph([text("Inspected by:")], {
              spacingAfter: 400,
            }),

            paragraph([text("_________________", { bold: true })], {
              indentLeft: 350,
              spacingAfter: 0,
            }),
            paragraph([text("Forest Ranger")], {
              indentLeft: 700,
              spacingAfter: 500,
            }),

            paragraph([text("Checked and verified by:")], {
              spacingAfter: 400,
            }),

            paragraph([text("Forester Ida O. Goden", { bold: true })], {
              indentLeft: 700,
              spacingAfter: 0,
            }),
            paragraph([text("FII/ FUS Focal Person")], {
              indentLeft: 700, 
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const safeName = ownerName
      ? ownerName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      : "chainsaw_permit";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeName}_permit.docx"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to export chainsaw permit" },
      { status: 500 },
    );
  }
}
