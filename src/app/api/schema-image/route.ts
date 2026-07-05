import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SchemaImageContext = "diagnosis" | "instruction" | "learning";

type SchemaImageRequestBody = {
  context?: unknown;
  title?: unknown;
  subject?: unknown;
  details?: unknown;
};

type OpenAiImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
  error?: {
    message?: string;
  };
};

type ImageRequestBody = {
  model: string;
  prompt: string;
  size: string;
  n: number;
  quality?: string;
  output_format?: string;
};

const CONTEXT_LABELS: Record<SchemaImageContext, string> = {
  diagnosis: "Diagnosefall",
  instruction: "Werkstatt-Anleitung",
  learning: "Lerninhalt",
};

const CONTEXT_COMPOSITION: Record<SchemaImageContext, string> = {
  diagnosis:
    "diagnostic checkpoint board: left column shows the symptom as a simple icon, center columns show the inspected system with exact test points, right column shows OK/NOK decision branches.",
  instruction:
    "repair instruction checkpoint board: left column shows access area, center columns show concrete inspection points before disassembly, right column shows mounting, locking and final-check points.",
  learning:
    "learning checkpoint board: left column shows functional flow, center columns show typical measurement points, right column shows plausible and implausible OK/NOK result branches.",
};

const MARKER_ROLE_GUIDE = `
Fixed marker roles:
- P1 = first visual inspection at the most likely physical fault area.
- P2 = connector, wiring, fuse, supply voltage or ground test point.
- P3 = signal, live data, sensor plausibility or actuator command test point.
- P4 = pressure, vacuum, leak, flow, mechanical movement or load test point.
- P5 = final confirmation: clear fault, plausibility check, road-test or repeat measurement.
- M1 = multimeter icon, M2 = diagnostic scanner icon, M3 = pressure gauge / hand pump icon, M4 = smoke tester / leak finder icon.
`.trim();

const DIAGNOSIS_LAYOUT_BLUEPRINT = `
Diagnostic layout blueprint:
- Use a strict 4-column technical board.
- Column 1: symptom/source icon and first suspected area, with P1 only.
- Column 2: component access and connector/electrical checks, with P2 and M1/M2 where useful.
- Column 3: system function, sensor/actuator relation, pressure/leak/flow checks, with P3 and P4.
- Column 4: decision result path with two clean branches: OK and NOK, plus P5 as final verification.
- Add one lower measurement lane that connects P1 -> P2 -> P3 -> P4 -> P5 with numbered arrows.
- Use 2 to 4 zoom insets, each tied to a marker: connector pins, hose clamp, gasket edge, sensor tip, pressure port, ground point, leak point or actuator linkage.
- Highlight exactly 2 to 4 realistic fault candidates with small yellow warning triangles near the related marker.
- Keep the drawing orthographic or clean isometric; do not use cinematic perspective.
`.trim();

function getTopicSpecificBlueprint(subject: string, details: string) {
  const text = `${subject} ${details}`.toLowerCase();

  if (
    text.includes("keilriemen") ||
    text.includes("rippenriemen") ||
    text.includes("riemenlauf") ||
    text.includes("riemenverlauf") ||
    text.includes("serpentine belt") ||
    text.includes("belt routing")
  ) {
    return `
Topic-specific blueprint: belt routing and belt diagnosis.
- Draw a mechanically plausible front accessory drive only, not unrelated engine systems.
- Show crankshaft pulley, alternator pulley, tensioner pulley, at least one idler pulley, and only optional pulleys that fit the described topic such as A/C compressor, water pump or power steering.
- The belt must be one continuous thick loop following a believable routing path around the pulleys. No broken belt path, no random crossing, no impossible S-curves.
- Show belt travel direction with arrows on the belt. Indicate ribbed side versus smooth back side visually by line texture, not by words.
- P1: belt visual inspection area: cracks, missing ribs, glazing, frayed edge or contamination.
- P2: pulley alignment and groove inspection: straightedge symbol, pulley face and belt edge tracking.
- P3: tensioner pointer/travel range and spring movement: show a small pointer window and movement arc.
- P4: bearing/freewheel/noise check: idler or alternator clutch with rotation arrow and stethoscope/listening icon.
- P5: running confirmation: belt tracking centered on all pulleys after load change.
- Add zoom insets for belt ribs, tensioner pointer, pulley grooves, and belt edge dust/misalignment.
- Do not show hoses, turbochargers, exhaust parts, fuel rails, wiring looms or random sensors unless the text explicitly asks for them.
`.trim();
  }

  if (
    text.includes("ladedruck") ||
    text.includes("turbo") ||
    text.includes("boost") ||
    text.includes("unterdruck") ||
    text.includes("druckverlust")
  ) {
    return `
Topic-specific blueprint: boost pressure, vacuum and charge-air diagnosis.
- Show the air path in order: air filter/intake, turbo compressor, charge pipe, intercooler, throttle/intake manifold and pressure sensor when relevant.
- P1 at the most likely hose, clamp or crack location.
- P2 at connector, supply and ground of the boost pressure or control component.
- P3 at live data plausibility between command, sensor and actuator.
- P4 at smoke-test, pressure-test or vacuum actuator point.
- P5 at final road-test / boost plausibility branch.
- Zoom insets must focus on hose clamp, intercooler seam, sensor connector pins and actuator rod or vacuum nipple.
`.trim();
  }

  if (
    text.includes("can") ||
    text.includes("lin") ||
    text.includes("spannung") ||
    text.includes("masse") ||
    text.includes("stecker") ||
    text.includes("kabel") ||
    text.includes("signal")
  ) {
    return `
Topic-specific blueprint: electrical diagnosis.
- Show battery/fuse/relay/control unit/sensor or actuator as a clean circuit path, not a loose cable mess.
- P1 at visible harness damage, water ingress or rubbed-through insulation.
- P2 at connector pin, fuse, supply voltage and ground.
- P3 at signal line, bus line or live data plausibility.
- P4 only if the topic has a load, actuator movement or pressure/flow result.
- P5 at repaired connector and repeat measurement confirmation.
- Zoom insets must show connector lock, pin numbering shape, ground eyelet, fuse contact or probe back-pin position.
`.trim();
  }

  if (
    text.includes("kühl") ||
    text.includes("thermostat") ||
    text.includes("wasserpumpe") ||
    text.includes("temperatur") ||
    text.includes("überhit")
  ) {
    return `
Topic-specific blueprint: cooling system diagnosis.
- Show coolant flow in order: engine block, thermostat, radiator, expansion tank, heater core and water pump when relevant.
- Use arrows to show hot/cold flow and bypass path. Do not draw a generic pipe maze.
- P1 at leak trace, hose swelling, cap or reservoir level.
- P2 at fan, temperature sensor or electrical supply only when relevant.
- P3 at live temperature plausibility and thermostat opening behavior.
- P4 at pressure test or pump circulation check.
- P5 at stable temperature after warm-up confirmation.
`.trim();
  }

  return `
Topic-specific blueprint:
- Use the named component or fault from the topic as the central object. Do not substitute a different automotive system.
- Include only neighboring parts that help the diagnosis.
- The viewer must understand the inspection order and likely failure locations from the image alone.
`.trim();
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeContext(value: unknown): SchemaImageContext {
  if (value === "instruction" || value === "learning") {
    return value;
  }

  return "diagnosis";
}

function getImageModel() {
  return process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
}

function getImageSize() {
  return process.env.OPENAI_IMAGE_SIZE || "1536x1024";
}

function getImageQuality() {
  return process.env.OPENAI_IMAGE_QUALITY || "high";
}

function buildSchemaPrompt({
  context,
  title,
  subject,
  details,
}: {
  context: SchemaImageContext;
  title: string;
  subject: string;
  details: string;
}) {
  const topicSpecificBlueprint = getTopicSpecificBlueprint(subject, details);

  return `
Create a very detailed, structured technical checkpoint diagram for DiagnoseHUB.
The marker legend is shown outside the image in the app. The image itself must be almost text-free.

Context: ${CONTEXT_LABELS[context]}
Title: ${title || subject}
Topic: ${subject}
Technical diagnosis content: ${details}

Primary composition:
- Format: professional automotive service manual plate, not a poster, not an advertisement.
- Composition type: ${CONTEXT_COMPOSITION[context]}
- Assume the technician has only this image and must use it to perform a real diagnosis. The graphic must show WHERE to test, WHAT to compare visually, and IN WHAT ORDER to test.
- It must not be a generic component map, decorative overview or symbolic placeholder.
- Every drawn part must have a diagnostic purpose. Remove anything that does not help the test sequence.
- Use a clean white/light grey background with a subtle technical grid and thin alignment guides.
- Use precise CAD-like vector line art with clear separation between components, connectors, hoses, pipes, sensors, brackets, seals, clamps and mounting points.
- Use cross-section, exploded view, flow diagram or cutaway only when it helps the test sequence.
- Show 6 to 12 relevant technical elements if enough context is available.
- Arrows must show real technical flow: air, exhaust, fuel, coolant, current, signal, vacuum, pressure or mechanical force.

${topicSpecificBlueprint}

${context === "diagnosis" ? DIAGNOSIS_LAYOUT_BLUEPRINT : ""}

${MARKER_ROLE_GUIDE}

Marker and structure rules:
- Place large circular markers P1, P2, P3, P4 and P5 exactly at the test locations.
- The marker sequence must read visually from left to right: P1 -> P2 -> P3 -> P4 -> P5.
- If the topic is a route, belt path, flow path or wiring path, the path must be continuous and physically plausible from start to end.
- Use magnified insets for the actual suspected failure surfaces: belt ribs, grooves, seal lips, connector pins, hose cracks, pressure ports, ground points, actuator rods or bearing faces.
- Each marker must show a visible diagnostic action, not only a label: inspection magnifier, probe tips, straightedge, gauge needle, smoke nozzle, rotation arrow, movement arc, leak bubbles, wear trace, crack pattern or centered tracking line.
- P1 to P5 must be understandable even if the app legend is not visible. Use icons and physical cues to make the test method obvious.
- Use M1, M2, M3 or M4 only as small tool badges next to the relevant P marker.
- Add clean arrows between markers. Avoid crossing arrows.
- Decision branches may contain only OK, NOK, checkmark, cross, question mark and arrows.
- Use yellow warning triangles only near concrete suspected fault locations.
- Every inset must be connected by a thin leader line to its source marker.
- Leave enough empty spacing around markers; do not overlap markers, arrows, insets or components.

Strict text rules:
- Do not write any full words inside the image.
- Allowed text inside the image only: P1, P2, P3, P4, P5, M1, M2, M3, M4, OK, NOK.
- Do not write German words. Do not write: Sicht, Sichtprüfung, Signal, Lecktest, Stecker, Druck, Masse, DiagnoseHUB, Fehler, Leistungsverlust.
- Do not add a title, logo, title block, paragraph, legend, measurements, part numbers, torque values or invented values.
- If explanation seems necessary, replace it with icons, arrows, magnifier, multimeter, pressure gauge, smoke tester, connector-pin symbol, leak symbol or warning triangle.

Style limits:
- No photorealistic repair photo.
- No humans, no hands, no workshop photo, no brand logos, no license plates.
- No decorative 3D rendering, no comic style, no chaotic cable or hose pile.
- No invented exact manufacturer values, part numbers, torque specs or special tool numbers.
- Safety-related topics must be shown only as a neutral inspection/system overview.

Quality target:
- The result must look like a structured visual diagnostic test plan at first glance.
- Prioritize test sequence, measurement points, decision paths and typical fault locations over general system overview.
- Make the image calm, legible and mechanically plausible.
  `.trim();
}

function extractImagePayload(data: OpenAiImageResponse) {
  const image = data.data?.[0];

  if (!image) {
    throw new Error("OpenAI hat kein Bild zurückgegeben.");
  }

  if (image.b64_json) {
    return {
      imageUrl: `data:image/png;base64,${image.b64_json}`,
      revisedPrompt: image.revised_prompt || "",
    };
  }

  if (image.url) {
    return {
      imageUrl: image.url,
      revisedPrompt: image.revised_prompt || "",
    };
  }

  throw new Error("OpenAI hat kein auslesbares Bildformat geliefert.");
}

function parseOpenAiResponseText(openAiText: string) {
  if (!openAiText) {
    return {};
  }

  try {
    return JSON.parse(openAiText) as OpenAiImageResponse;
  } catch {
    throw new Error(
      `OpenAI hat keine gültige JSON-Antwort geliefert: ${openAiText.slice(
        0,
        300,
      )}`,
    );
  }
}

async function requestOpenAiImage(apiKey: string, body: ImageRequestBody) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const data = parseOpenAiResponseText(text);

  return {
    response,
    data,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY fehlt. Bitte in .env.local oder Vercel eintragen.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as SchemaImageRequestBody;
    const context = normalizeContext(body.context);
    const title = sanitizeText(body.title, 180);
    const subject = sanitizeText(body.subject, 240);
    const details = sanitizeText(body.details, 3200);

    if (subject.length < 2 && details.length < 8) {
      return NextResponse.json(
        {
          error:
            "Bitte gib ein technisches Thema oder ausreichend Kontext für die Schema-Grafik an.",
        },
        { status: 400 },
      );
    }

    const prompt = buildSchemaPrompt({
      context,
      title,
      subject: subject || title || "Technisches Werkstatt-Schema",
      details: details || subject || title,
    });

    const model = getImageModel();
    const imageSize = getImageSize();
    const imageQuality = getImageQuality();
    let usedImageSize = imageSize;
    let usedImageQuality = imageQuality;

    let imageResult = await requestOpenAiImage(apiKey, {
      model,
      prompt,
      size: imageSize,
      quality: imageQuality,
      output_format: "png",
      n: 1,
    });

    if (!imageResult.response.ok) {
      usedImageSize = "1024x1024";
      usedImageQuality = "standard";

      imageResult = await requestOpenAiImage(apiKey, {
        model,
        prompt,
        size: "1024x1024",
        n: 1,
      });
    }

    if (!imageResult.response.ok) {
      return NextResponse.json(
        {
          error:
            imageResult.data.error?.message ||
            `Schema-Grafik konnte nicht erstellt werden. Status: ${imageResult.response.status}`,
        },
        { status: imageResult.response.status },
      );
    }

    const imagePayload = extractImagePayload(imageResult.data);

    return NextResponse.json({
      ...imagePayload,
      model,
      context,
      imageSize: usedImageSize,
      imageQuality: usedImageQuality,
    });
  } catch (error) {
    console.error("Schema-Bild konnte nicht erstellt werden:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Schema-Bild konnte nicht erstellt werden.",
      },
      { status: 500 },
    );
  }
}
