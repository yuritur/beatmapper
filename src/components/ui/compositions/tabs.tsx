import type { CollectionItem, ListCollection } from "@ark-ui/react";
import type { UseTabsContext } from "@ark-ui/react/tabs";
import type { ComponentProps, ReactNode } from "react";

import { css } from "$:styled-system/css";
import { ListCollectionFor } from "../atoms";
import * as Builder from "../styled/tabs";
import type { VirtualColorPalette } from "../types";

export interface TabsItem extends CollectionItem {
	value: string;
	render: (ctx: UseTabsContext) => ReactNode;
}

export interface TabsProps<T extends TabsItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
	colorPalette?: VirtualColorPalette;
}
export function Tabs<T extends TabsItem>({ collection, colorPalette = "pink", ...rest }: TabsProps<T>) {
	return (
		<Builder.Root defaultValue={rest.defaultValue ?? collection.firstValue} {...rest}>
			<Builder.List className={css({ colorPalette })}>
				<ListCollectionFor collection={collection}>
					{(item) => {
						const value = collection.getItemValue(item);
						if (!value) return null;
						const label = collection.stringifyItem(item);
						const disabled = collection.getItemDisabled(item);
						return (
							<Builder.Trigger key={value} value={value} disabled={disabled}>
								{label}
							</Builder.Trigger>
						);
					}}
				</ListCollectionFor>
				<Builder.Indicator />
			</Builder.List>
			<ListCollectionFor collection={collection}>
				{(item) => {
					const value = collection.getItemValue(item);
					if (!value) return null;
					return (
						<Builder.Context key={value}>
							{(ctx) => (
								<Builder.Content key={value} value={value} tabIndex={-1}>
									{item.render(ctx)}
								</Builder.Content>
							)}
						</Builder.Context>
					);
				}}
			</ListCollectionFor>
		</Builder.Root>
	);
}
