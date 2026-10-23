# make-assets.ps1 -- gera simbolo recortado, favicons e imagem Open Graph.
# Requer apenas System.Drawing (presente no Windows). Nao instala nada.
# Executar: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-assets.ps1
param(
  [string]$SrcLogo = "assets/logo/LOGO_AF_HORIZONTAL.png",
  [string]$OutDir  = "assets/img"
)

Add-Type -AssemblyName System.Drawing

function C([string]$hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }

function Get-Pixels([string]$path) {
  $bmp = [System.Drawing.Bitmap]::FromFile($path)
  $rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = New-Object byte[] ($data.Stride * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  $bmp.UnlockBits($data)
  $info = [pscustomobject]@{ Bytes = $bytes; W = $bmp.Width; H = $bmp.Height; Stride = $data.Stride }
  $bmp.Dispose()
  return $info
}

$paper = C "#F7F6F3"
$cores = @("#ED3237", "#E9A13B", "#E8C43B", "#4C9A52", "#2387C7", "#703C94") | ForEach-Object { C $_ }
$src = (Resolve-Path $SrcLogo).Path

New-Item -ItemType Directory -Force -Path $OutDir, "assets/logo" | Out-Null

# ---- 1. localizar a vala entre o anel e o texto ----
$img = Get-Pixels $src
$melhor = [int]::MaxValue
$gap = 820
for ($x = 700; $x -lt [Math]::Min($img.W, 1300); $x += 2) {
  $c = 0
  for ($y = 0; $y -lt $img.H; $y += 4) {
    if ($img.Bytes[$y * $img.Stride + $x * 4 + 3] -gt 16) { $c++ }
  }
  if ($c -lt $melhor) { $melhor = $c; $gap = $x }
}
"vala em x=$gap (pixels opacos na coluna: $melhor)"

# ---- 2. bounding box do anel ----
$minX = $img.W; $minY = $img.H; $maxX = -1; $maxY = -1
for ($y = 0; $y -lt $img.H; $y += 2) {
  for ($x = 0; $x -lt $gap; $x += 2) {
    if ($img.Bytes[$y * $img.Stride + $x * 4 + 3] -gt 16) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$w = $maxX - $minX + 1
$h = $maxY - $minY + 1
if ($w -lt 100 -or $h -lt 100) { throw "recorte invalido: $minX,$minY ${w}x${h} (gap=$gap)" }

# ---- 3. simbolo quadrado ----
$lado = [Math]::Max($w, $h)
$simbolo = New-Object System.Drawing.Bitmap($lado, $lado)
$g = [System.Drawing.Graphics]::FromImage($simbolo)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::Transparent)
$origem = [System.Drawing.Image]::FromFile($src)
$destino = New-Object System.Drawing.Rectangle([int](($lado - $w) / 2), [int](($lado - $h) / 2), $w, $h)
$fonte = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
$g.DrawImage($origem, $destino, $fonte, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$simbolo.Save("assets/logo/simbolo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$simbolo.Dispose()

# ---- 4. anel chapado, legivel em 16px ----
function New-Anel([int]$size, [bool]$fundo) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $gr = [System.Drawing.Graphics]::FromImage($bmp)
  $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  if ($fundo) { $gr.Clear($paper) } else { $gr.Clear([System.Drawing.Color]::Transparent) }
  $esp = [float][Math]::Max(2.0, $size * 0.26)
  $pad = [float]($esp / 2 + $size * 0.06)
  $rect = New-Object System.Drawing.RectangleF($pad, $pad, [float]($size - 2 * $pad), [float]($size - 2 * $pad))
  for ($i = 0; $i -lt 6; $i++) {
    $caneta = New-Object System.Drawing.Pen($cores[$i], $esp)
    $gr.DrawArc($caneta, $rect, [float]($i * 60 - 90), [float]57)
    $caneta.Dispose()
  }
  $gr.Dispose()
  return $bmp
}

foreach ($par in @(@(16, "favicon-16.png"), @(32, "favicon-32.png"))) {
  $bmp = New-Anel $par[0] $false
  $bmp.Save("$OutDir/$($par[1])", [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
$bmp = New-Anel 180 $true
$bmp.Save("$OutDir/apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ---- 5. imagem Open Graph 1200x630 ----
$og = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear($paper)

$logo = [System.Drawing.Image]::FromFile($src)
$largura = 460
$altura = [int]($logo.Height * ($largura / $logo.Width))
$yLogo = [int]((630 - $altura) / 2) - 40
$destinoLogo = New-Object System.Drawing.Rectangle(70, $yLogo, $largura, $altura)
$g.DrawImage($logo, $destinoLogo)

$fonteTitulo = New-Object System.Drawing.Font("Segoe UI", 30, [System.Drawing.FontStyle]::Bold)
$fonteTexto = New-Object System.Drawing.Font("Consolas", 17, [System.Drawing.FontStyle]::Regular)
$navy = New-Object System.Drawing.SolidBrush((C "#333468"))
$cinza = New-Object System.Drawing.SolidBrush((C "#5A5B72"))

$xTexto = 570
$larguraMax = 1200 - $xTexto - 70

function Draw-Linha([string]$texto, $fonte, $pincel, [int]$y) {
  $medida = $g.MeasureString($texto, $fonte)
  if ($medida.Width -gt $larguraMax) {
    throw "texto estoura a area segura ($([int]$medida.Width)px de $larguraMax): $texto"
  }
  $g.DrawString($texto, $fonte, $pincel, $xTexto, $y)
}

Draw-Linha "Vitória da Conquista / BA" $fonteTitulo $navy 232
Draw-Linha "Tintas · texturas · bases · ferramentas" $fonteTexto $cinza 300
Draw-Linha "Materiais para pintura" $fonteTexto $cinza 330
Draw-Linha "@atacadaodast" $fonteTexto $navy 372

$bloco = 1200 / 6
for ($i = 0; $i -lt 6; $i++) {
  $b = New-Object System.Drawing.SolidBrush($cores[$i])
  $g.FillRectangle($b, [int]($i * $bloco), 606, [int]$bloco + 1, 24)
  $b.Dispose()
}
$g.Dispose()
$og.Save("$OutDir/og-1200x630.png", [System.Drawing.Imaging.ImageFormat]::Png)
$og.Dispose()

# ---- 6. versoes leves para a pagina (o original tem 3.5k px e 700 KB) ----
function Save-Redimensionado([string]$origem, [int]$largura, [string]$destino) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $origem).Path)
  $altura = [int]($img.Height * ($largura / $img.Width))
  $bmp = New-Object System.Drawing.Bitmap($largura, $altura)
  $gr = [System.Drawing.Graphics]::FromImage($bmp)
  $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gr.Clear([System.Drawing.Color]::Transparent)
  $gr.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $largura, $altura)))
  $gr.Dispose()
  $img.Dispose()
  $bmp.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Save-Redimensionado "assets/logo/simbolo.png" 96 "$OutDir/simbolo-96.png"
Save-Redimensionado $SrcLogo 180 "$OutDir/logo-rodape.png"

"ok: simbolo ${w}x${h} -> ${lado}x${lado} (gap x=$gap), favicons, og-1200x630 e versoes leves"

