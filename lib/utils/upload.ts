type UploadBucket = "receitas-fotos" | "avatares";

interface CropOptions {
  focusX?: number;
  focusY?: number;
}

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSourceFileSizeByBucket: Record<UploadBucket, number> = {
  "receitas-fotos": 8 * 1024 * 1024,
  avatares: 5 * 1024 * 1024,
};

function clampFocus(value: number) {
  return Math.min(100, Math.max(0, value));
}

function assertValidSourceFile(file: File, bucket: UploadBucket) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Use uma imagem JPG, PNG ou WebP.");
  }

  if (file.size > maxSourceFileSizeByBucket[bucket]) {
    throw new Error("Imagem muito grande para upload.");
  }
}

async function cropImage(file: File, bucket: UploadBucket, options: CropOptions = {}) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar imagem."));
    };
    img.src = url;
  });

  const targetWidth = bucket === "avatares" ? 800 : 1200;
  const targetHeight = bucket === "avatares" ? 800 : 900;
  const sourceRatio = image.width / image.height;
  const targetRatio = targetWidth / targetHeight;
  const focusX = clampFocus(options.focusX ?? 50);
  const focusY = clampFocus(options.focusY ?? 50);

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let offsetX = 0;
  let offsetY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    const maxOffsetX = image.width - sourceWidth;
    offsetX = (focusX / 100) * maxOffsetX;
  } else {
    sourceHeight = image.width / targetRatio;
    const maxOffsetY = image.height - sourceHeight;
    offsetY = (focusY / 100) * maxOffsetY;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Falha ao preparar crop da imagem.");
  }

  context.drawImage(
    image,
    offsetX,
    offsetY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) {
    throw new Error("Falha ao gerar imagem otimizada.");
  }

  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

export async function uploadFoto(
  file: File,
  bucket: UploadBucket,
  options: CropOptions = {},
): Promise<string> {
  assertValidSourceFile(file, bucket);

  const prepared = await cropImage(file, bucket, options);

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucket,
      filename: prepared.name,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao obter URL de upload");
  }

  const { uploadUrl, publicUrl } = (await response.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": prepared.type,
    },
    body: prepared,
  });

  if (!uploadResponse.ok) {
    throw new Error("Falha no upload da imagem");
  }

  return publicUrl;
}
