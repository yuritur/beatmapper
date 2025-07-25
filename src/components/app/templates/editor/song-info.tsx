import type { SelectValueChangeDetails } from "@ark-ui/react/select";
import { useNavigate } from "@tanstack/react-router";
import type { CharacteristicName, DifficultyName } from "bsmap/types";
import { PlusIcon } from "lucide-react";
import { Fragment, memo, useCallback, useMemo } from "react";

import { createBeatmapListCollection } from "$/components/app/constants";
import { addBeatmap, updateSelectedBeatmap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapIds, selectSelectedBeatmap, selectSongMetadata, selectUsername } from "$/store/selectors";
import type { BeatmapId, SongId } from "$/types";

import { HStack, Stack, styled } from "$:styled-system/jsx";
import { CoverArtFilePreview } from "$/components/app/compositions";
import { CreateBeatmapForm } from "$/components/app/forms";
import { Button, Dialog, Select, Text } from "$/components/ui/compositions";
import { useViewFromLocation } from "../../hooks";

const COVER_ART_SIZES = {
	medium: 75,
	small: 50,
};

interface Props {
	sid: SongId;
	bid: BeatmapId;
	showDifficultySelector: boolean;
}
function EditorSongInfo({ sid, bid, showDifficultySelector }: Props) {
	const dispatch = useAppDispatch();
	const view = useViewFromLocation();
	const navigate = useNavigate();
	const username = useAppSelector(selectUsername);
	const metadata = useAppSelector((state) => selectSongMetadata(state, sid));
	const selectedBeatmap = useAppSelector((state) => selectSelectedBeatmap(state, sid));
	const beatmapIds = useAppSelector((state) => selectBeatmapIds(state, sid));

	const BEATMAP_LIST_COLLECTION = useMemo(() => createBeatmapListCollection({ beatmapIds }), [beatmapIds]);

	const handleBeatmapSelect = useCallback(
		(details: SelectValueChangeDetails) => {
			dispatch(updateSelectedBeatmap({ songId: sid, beatmapId: details.value[0] }));
			return navigate({ to: `/edit/$sid/$bid/${view}`, params: { sid: sid.toString(), bid: details.value[0] } });
		},
		[dispatch, navigate, sid, view],
	);

	const handleCreate = useCallback(
		(id: BeatmapId, data: { characteristic: CharacteristicName; difficulty: DifficultyName }) => {
			dispatch(addBeatmap({ songId: sid, beatmapId: id, data: data, username }));
		},
		[dispatch, sid, username],
	);

	return (
		<Fragment>
			<OuterWrapper gap={1.5}>
				<CoverArtFilePreview songId={sid} width={COVER_ART_SIZES[showDifficultySelector ? "medium" : "small"]} />
				<Stack gap={1}>
					<Stack gap={0.5}>
						<Text color={"fg.default"} fontSize="20px" fontWeight={400} lineHeight={1}>
							{metadata.title}
						</Text>
						<Text color={"fg.muted"} fontSize="16px" fontWeight={400} lineHeight={1}>
							{metadata.artist}
						</Text>
					</Stack>
					{showDifficultySelector && bid && (
						<Fragment>
							<HStack gap={0.5}>
								<Select size="sm" collection={BEATMAP_LIST_COLLECTION} value={[selectedBeatmap.toString()]} onValueChange={handleBeatmapSelect} />
								<Dialog
									title="Create New Beatmap"
									unmountOnExit
									render={(ctx) => (
										<CreateBeatmapForm dialog={ctx} sid={sid} bid={bid} onSubmit={handleCreate}>
											{() => "Create beatmap"}
										</CreateBeatmapForm>
									)}
								>
									<Button variant="ghost" size="sm">
										<PlusIcon size={16} />
									</Button>
								</Dialog>
							</HStack>
						</Fragment>
					)}
				</Stack>
			</OuterWrapper>
		</Fragment>
	);
}

const OuterWrapper = styled(HStack, {
	base: {
		position: "absolute",
		zIndex: 1,
		top: 2,
		left: 2,
		userSelect: "none",
	},
});

export default memo(EditorSongInfo);
