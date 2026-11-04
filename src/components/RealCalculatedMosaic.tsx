import React, { useEffect, useRef } from 'react';

interface RealCalculatedMosaicProps {
  width: number;
  height: number;
  blockSize?: number; // 马赛克像素块大小，默认 6px
  imageSrc?: string;   // 可选底图路径（如 Coach 展示框图像）
  drawContent?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void; // 自定义离屏内容绘制
  className?: string;
  style?: React.CSSProperties;
  swapIntervalMs?: number;
  swapCount?: number;
}

interface BlockColor {
  r: number;
  g: number;
  b: number;
}

/**
 * 真实计算动态马赛克组件 (Real Calculated Dynamic Mosaic)
 * 原理：
 * 1. 绘制底色和原始图形内容（或加载图像）。
 * 2. 精确计算每个 blockSize x blockSize 方块内的平均 RGB 颜色。
 * 3. 网页加载（挂载）时随机确定四组各自的马赛克方块位置。
 * 4. 每组独立进行顺序后推一位的颜色交换，互不干扰。
 * 5. 每组的交换持续时间和空闲时间相同，均为 0.1s - 0.9s 中的随机时间，一轮交换-空闲结束后重新随机时间。
 * 6. 每次交换出现有 50% 几率立刻闪烁一次（消失 0.1s 再出现，重新执行本次交换时长）。
 * 7. 交换色彩时，向左右邻居方块产生色彩晕染/扩散影响。
 */
export const RealCalculatedMosaic: React.FC<RealCalculatedMosaicProps> = ({
  width,
  height,
  blockSize = 6,
  imageSrc,
  drawContent,
  className = '',
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 Canvas 分辨率 (结合 Retina 设备像素比，保证不同分辨率屏幕上马赛克边缘锐利清晰)
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    let isCancelled = false;
    const groupTimeouts: (number | null)[] = [null, null, null, null];

    const initMosaicWithOffscreen = (offCtx: CanvasRenderingContext2D) => {
      if (isCancelled) return;

      // 2. 提取像素图像数据，进行马赛克块平均色彩真实计算
      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const cols = Math.ceil(width / blockSize);
      const rows = Math.ceil(height / blockSize);

      // 计算基准色彩矩阵
      const baseBlocks: BlockColor[][] = [];

      for (let r = 0; r < rows; r++) {
        const rowColors: BlockColor[] = [];
        const y = r * blockSize;

        for (let c = 0; c < cols; c++) {
          const x = c * blockSize;
          let rSum = 0, gSum = 0, bSum = 0, count = 0;

          for (let dy = 0; dy < blockSize && (y + dy) < height; dy++) {
            for (let dx = 0; dx < blockSize && (x + dx) < width; dx++) {
              const index = ((y + dy) * width + (x + dx)) * 4;
              rSum += data[index];
              gSum += data[index + 1];
              bSum += data[index + 2];
              count++;
            }
          }

          rowColors.push({
            r: Math.round(rSum / Math.max(1, count)),
            g: Math.round(gSum / Math.max(1, count)),
            b: Math.round(bSum / Math.max(1, count)),
          });
        }
        baseBlocks.push(rowColors);
      }

      // 保存当前动态矩阵（用于渲染）
      const activeBlocks: BlockColor[][] = baseBlocks.map(row => row.map(col => ({ ...col })));

      // 渲染马赛克画布的核心方法
      const renderMosaic = () => {
        for (let r = 0; r < rows; r++) {
          const y = r * blockSize;
          for (let c = 0; c < cols; c++) {
            const x = c * blockSize;
            const { r: red, g: green, b: blue } = activeBlocks[r][c];
            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.fillRect(x, y, blockSize, blockSize);
          }
        }
      };

      // 首次渲染基准色彩
      renderMosaic();

      // 3. 计算交换方块数量：
      // - 之前原有的 srcreat 保持固定 10 个方块
      // - 后来新增的 Coach (包含 imageSrc, 且单方块面积*4) 等比缩小为 /4（每组约 9~10 个）
      const totalBlocks = rows * cols;
      const countPerGroup = imageSrc ? Math.max(2, Math.round(totalBlocks * 0.022)) : 10;
      const usedIndices = new Set<number>();

      // 60度灰偏移函数：通道向 153 (60%灰度) 偏移 10 个单位，越过 153 则固定为 153
      const shiftToward60Gray = (val: number): number => {
        const target = 153; // 60度灰 (255 * 0.6 = 153)
        const shift = 10;
        if (val < target) {
          return Math.min(val + shift, target);
        } else if (val > target) {
          return Math.max(val - shift, target);
        }
        return target;
      };

      const adjustColorTo60Gray = (color: { r: number; g: number; b: number }) => ({
        r: shiftToward60Gray(color.r),
        g: shiftToward60Gray(color.g),
        b: shiftToward60Gray(color.b),
      });

      const createGroup = (count: number) => {
        const countToSelect = Math.min(count, totalBlocks);
        const selectedIndices = new Set<number>();

        while (selectedIndices.size < countToSelect) {
          const available: number[] = [];
          for (let i = 0; i < totalBlocks; i++) {
            if (!usedIndices.has(i)) available.push(i);
          }

          if (available.length > 0) {
            const randomIndex = available[Math.floor(Math.random() * available.length)];
            selectedIndices.add(randomIndex);
            usedIndices.add(randomIndex);
          } else {
            const randomIndex = Math.floor(Math.random() * totalBlocks);
            selectedIndices.add(randomIndex);
          }
        }

        const selectedPositions = Array.from(selectedIndices).map(idx => ({
          r: Math.floor(idx / cols),
          c: idx % cols,
        }));

        // 保存对应的原始基准色彩
        const selectedBaseColors = selectedPositions.map(pos => ({
          ...baseBlocks[pos.r][pos.c],
        }));

        // 计算后推一位后的交换色彩，并向60度灰（153）偏移10度（越过则止于153）
        const swappedColors = selectedPositions.map((_, i) => {
          const prevIndex = (i - 1 + selectedPositions.length) % selectedPositions.length;
          return adjustColorTo60Gray(selectedBaseColors[prevIndex]);
        });

        return {
          positions: selectedPositions,
          baseColors: selectedBaseColors,
          swappedColors,
        };
      };

      // 创建四组，每组 countPerGroup 个方块
      const groups = [createGroup(countPerGroup), createGroup(countPerGroup), createGroup(countPerGroup), createGroup(countPerGroup)];
      const groupIsSwapped = [false, false, false, false];

      // 更新整个画布方块色彩（包含中心交换方块及周边一圈邻居色彩扩散）并重绘
      const updateBlocksAndRender = () => {
        if (isCancelled) return;
        // 1. 重置所有方块为基准原始色彩
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            activeBlocks[r][c] = { ...baseBlocks[r][c] };
          }
        }

        // 2. 依次应用处于交换状态的组的中心色彩
        groups.forEach((group, groupIdx) => {
          if (!groupIsSwapped[groupIdx]) return;
          for (let i = 0; i < group.positions.length; i++) {
            const pos = group.positions[i];
            activeBlocks[pos.r][pos.c] = { ...group.swappedColors[i] };
          }
        });

        // 3. 对处于交换状态的组，仅向左右两个邻居单元格产生色彩扩散/晕染效果（强度 12%）
        const neighborConfig = [
          { dr: 0, dc: -1, factor: 0.12 },  // 左（12%）
          { dr: 0, dc: 1, factor: 0.12 },   // 右（12%）
        ];

        groups.forEach((group, groupIdx) => {
          if (!groupIsSwapped[groupIdx]) return;
          for (let i = 0; i < group.positions.length; i++) {
            const pos = group.positions[i];
            const targetColor = group.swappedColors[i];

            for (const { dr, dc, factor } of neighborConfig) {
              const nr = pos.r + dr;
              const nc = pos.c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                const curr = activeBlocks[nr][nc];
                activeBlocks[nr][nc] = {
                  r: Math.round(curr.r * (1 - factor) + targetColor.r * factor),
                  g: Math.round(curr.g * (1 - factor) + targetColor.g * factor),
                  b: Math.round(curr.b * (1 - factor) + targetColor.b * factor),
                };
              }
            }
          }
        });

        renderMosaic();
      };

      // 切换指定组的色彩状态并更新渲染
      const setGroupState = (groupIndex: number, isSwapped: boolean) => {
        groupIsSwapped[groupIndex] = isSwapped;
        updateBlocksAndRender();
      };

      // 4. 定时交换/空闲动画循环（四组独立并行运行，不进行换组）
      groups.forEach((_, groupIdx) => {
        const runGroupCycle = () => {
          if (isCancelled) return;

          // 随机生成 0.1s - 0.9s (100ms - 900ms) 的持续/空闲时间
          const durationMs = 100 + Math.random() * 800;
          const willFlicker = Math.random() < 0.4;

          const executeMainSwapPhase = () => {
            if (isCancelled) return;

            // 阶段 1：进入交换状态
            setGroupState(groupIdx, true);

            // 持续 durationMs 后进入空闲阶段
            groupTimeouts[groupIdx] = window.setTimeout(() => {
              if (isCancelled) return;

              // 阶段 2：恢复原始颜色（空闲状态）
              setGroupState(groupIdx, false);

              // 空闲 durationMs 后，完整一轮交换-空闲结束，重新随机时间并启动下一轮
              groupTimeouts[groupIdx] = window.setTimeout(() => {
                if (isCancelled) return;
                runGroupCycle();
              }, durationMs);

            }, durationMs);
          };

          if (willFlicker) {
            // 40% 几率立刻闪烁一次（消失 0.1s 再出现，重新执行本次交换时长）
            setGroupState(groupIdx, true);
            groupTimeouts[groupIdx] = window.setTimeout(() => {
              if (isCancelled) return;

              setGroupState(groupIdx, false); // 消失 0.1s

              groupTimeouts[groupIdx] = window.setTimeout(() => {
                if (isCancelled) return;

                // 0.1s 后再出现，重新执行本次交换时长
                executeMainSwapPhase();
              }, 100);

            }, 30);
          } else {
            executeMainSwapPhase();
          }
        };

        // 启动组的独立循环
        runGroupCycle();
      });
    };

    // 1. 在离屏 Canvas 上绘制原始底层真实内容
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    if (drawContent) {
      drawContent(offCtx, width, height);
      initMosaicWithOffscreen(offCtx);
    } else if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      if (img.complete && img.naturalWidth > 0) {
        offCtx.drawImage(img, 0, 0, width, height);
        initMosaicWithOffscreen(offCtx);
      } else {
        img.onload = () => {
          if (isCancelled) return;
          offCtx.drawImage(img, 0, 0, width, height);
          initMosaicWithOffscreen(offCtx);
        };
        img.onerror = () => {
          if (isCancelled) return;
          offCtx.fillStyle = '#1c1b1a';
          offCtx.fillRect(0, 0, width, height);
          initMosaicWithOffscreen(offCtx);
        };
      }
    } else {
      // 默认 PC srcreat 绘制
      offCtx.fillStyle = '#f5f3ef';
      offCtx.fillRect(0, 0, width, height);

      offCtx.fillStyle = '#3a3836';
      offCtx.beginPath();
      offCtx.rect(6, 8, 14, 14);
      offCtx.fill();

      offCtx.fillStyle = '#242221';
      offCtx.font = 'bold 15px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
      offCtx.textBaseline = 'top';
      offCtx.fillText('srcreat  拉美西斯', 28, 6);

      offCtx.fillStyle = '#7a7876';
      offCtx.font = '12px "PingFang SC", "Hiragino Sans GB", sans-serif';
      offCtx.fillText('◆ 筹划中', width - 68, 8);

      offCtx.strokeStyle = '#d6d3ce';
      offCtx.lineWidth = 1;
      offCtx.setLineDash([3, 3]);
      offCtx.beginPath();
      offCtx.moveTo(170, 15);
      offCtx.lineTo(width - 76, 15);
      offCtx.stroke();
      offCtx.setLineDash([]);

      offCtx.fillStyle = '#7a7876';
      offCtx.font = '11px "PingFang SC", "Hiragino Sans GB", sans-serif';
      offCtx.fillText('UX&UI设计 + 官网搭建', 28, 30);

      initMosaicWithOffscreen(offCtx);
    }

    return () => {
      isCancelled = true;
      groupTimeouts.forEach(id => {
        if (id !== null) clearTimeout(id);
      });
    };
  }, [width, height, blockSize, imageSrc, drawContent]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded ${className}`}
      style={{
        width: style?.width ?? `${width}px`,
        height: style?.height ?? `${height}px`,
        display: 'block',
        ...style,
      }}
    />
  );
};

