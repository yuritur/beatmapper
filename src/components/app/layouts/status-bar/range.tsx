import type { LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

import { HStack } from "$:styled-system/jsx";
import { Slider, Tooltip } from "$/components/ui/compositions";
import StatusBarIcon from "./icon";

interface Props extends ComponentProps<typeof Slider> {
	label?: string;
	minIcon: ComponentType<LucideProps>;
	maxIcon: ComponentType<LucideProps>;
}
function StatusBarRangeControl({ label, minIcon, maxIcon, min, max, step, value, onValueChange, disabled, ...delegated }: Props) {
	return (
		<Tooltip render={() => label}>
			<HStack gap={1}>
				<StatusBarIcon size={14} icon={minIcon} onClick={() => onValueChange?.({ value: [min ?? 0] })} disabled={disabled} />
				<Slider {...delegated} size="sm" min={min} max={max} step={step} value={value} onValueChange={onValueChange} disabled={disabled} />
				<StatusBarIcon size={14} icon={maxIcon} onClick={() => onValueChange?.({ value: [max ?? 100] })} disabled={disabled} />
			</HStack>
		</Tooltip>
	);
}

export default StatusBarRangeControl;
