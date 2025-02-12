import React, {Suspense, useContext, useMemo} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	CHECKERBOARD_BACKGROUND_POS,
	CHECKERBOARD_BACKGROUND_SIZE,
} from '../helpers/checkerboard-background';
import {Size} from '../hooks/get-el-size';
import {CheckerboardContext} from '../state/checkerboard';
import {PreviewSizeContext} from '../state/preview-size';

const checkerboardSize = 49;

export const Container = styled.div<{
	scale: number;
	xCorrection: number;
	yCorrection: number;
	width: number;
	height: number;
	checkerboard: boolean;
}>`
	transform: scale(${(props): number => props.scale});
	margin-left: ${(props): number => props.xCorrection}px;
	margin-top: ${(props): number => props.yCorrection}px;
	width: ${(props): number => props.width}px;
	height: ${(props): number => props.height}px;
	display: flex;
	position: absolute;
	background-color: ${(props) =>
		checkerboardBackgroundColor(props.checkerboard)};
	background-image: ${(props) =>
		checkerboardBackgroundImage(props.checkerboard)};
	background-size: ${CHECKERBOARD_BACKGROUND_SIZE(
		checkerboardSize
	)}; /* Must be a square */
	background-position: ${CHECKERBOARD_BACKGROUND_POS(
		checkerboardSize
	)}; /* Must be half of one side of the square */
`;

const Inner: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const {size: previewSize} = useContext(PreviewSizeContext);
	const video = Internals.useVideo();

	const config = useVideoConfig();
	const heightRatio = canvasSize.height / config.height;
	const widthRatio = canvasSize.width / config.width;
	const {checkerboard} = useContext(CheckerboardContext);

	const ratio = Math.min(heightRatio, widthRatio);

	const scale = previewSize === 'auto' ? ratio : Number(previewSize);
	const correction = 0 - (1 - scale) / 2;
	const xCorrection = correction * config.width;
	const yCorrection = correction * config.height;
	const width = config.width * scale;
	const height = config.height * scale;
	const centerX = canvasSize.width / 2 - width / 2;
	const centerY = canvasSize.height / 2 - height / 2;

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width: config.width * scale,
			height: config.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX,
			top: centerY,
			overflow: 'hidden',
		};
	}, [centerX, centerY, config.height, config.width, scale]);

	const Component = video ? video.component : null;

	return (
		<Suspense fallback={<div>loading...</div>}>
			<div style={outer}>
				<Container
					{...{
						checkerboard,
						scale,
						xCorrection,
						yCorrection,
						width: config.width,
						height: config.height,
					}}
				>
					{Component ? (
						<Component {...(((video?.props as unknown) as {}) ?? {})} />
					) : null}
				</Container>
			</div>
		</Suspense>
	);
};

export const VideoPreview: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const config = Internals.useUnsafeVideoConfig();

	if (!config) {
		return null;
	}
	return <Inner canvasSize={canvasSize} />;
};
