import { createFileRoute } from "@tanstack/react-router";

import { useAppSelector } from "$/store/hooks";
import { selectNew } from "$/store/selectors";

import { AppPageLayout } from "$/components/app/layouts";
import { FirstTimeHome, ReturningHome } from "$/components/app/templates/home";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const isNewUser = useAppSelector(selectNew);
	return <AppPageLayout>{isNewUser ? <FirstTimeHome /> : <ReturningHome />}</AppPageLayout>;
}
