#!/bin/sh
# Natural grade + controlled sharpening + lanczos 1.5x pre-upscale of the ORIGINAL factory footage (video only; audio kept in the original file).
ffmpeg -y -v error -i public/kings-ghs-manufacturing.mp4 -an \
 -vf "scale=1536:864:flags=lanczos,eq=contrast=1.06:brightness=0.01:saturation=1.04:gamma=1.02,unsharp=5:5:0.7:3:3:0.0" \
 -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p -r 30 public/footage-graded.mp4
