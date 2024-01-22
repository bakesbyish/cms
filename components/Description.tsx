import { useCallback, useState } from "react";

import { Button, Card, Spinner, Stack, Text, TextArea } from "@sanity/ui";
import { StringInputProps, set, unset, useFormValue } from "sanity";

export function Description(props: StringInputProps) {
	const {
		onChange,
		value = "",
		id,
		// @ts-ignore
		focusRef,
		// @ts-ignore
		onBlur,
		// @ts-ignore
		onFocus,
		readOnly,
	} = props;
	const [loading, setLoading] = useState(false);
	const productTitle = useFormValue(["title"]);

	// ⬇ We aren't doing anything with these except forwarding them to our input.
	const fwdProps = { id, ref: focusRef, onBlur, onFocus, readOnly };
	const handleChange = useCallback(
		(event: React.FormEvent<HTMLTextAreaElement>) =>
			onChange(
				event.currentTarget.value ? set(event.currentTarget.value) : unset(),
			),
		[onChange],
	);

	return (
		<Stack space={2}>
			<TextArea rows={10} onChange={handleChange} {...fwdProps} value={value} />
			<Text muted size={1}>
				Words: {value?.split(" ").length || 0}, Characters: {value?.length || 0}
			</Text>
			<Card paddingTop={3} style={{ textAlign: "left" }}>
				<Button
					onClick={async () => {
						if (!productTitle) {
							return;
						}
						try {
							setLoading(true);
							const res = await fetch(
								"https://functio.vercel.app/api/ai/gemini/generate",
								{
									method: "POST",
									body: JSON.stringify({
										req: `I have a Cake equipment shop for the website of that shop I was hoping you could write a concise yet simple description in simple English about ${productTitle}. When using markdown format use GitHub flavoured markdown format only and keep proper spacing too. (And the character length should not be more than 500 characters)`,
									}),
								},
							);
							const payload = (await res.json()) as {
								desc: string | null;
								err: string | null;
							};
							if (res.status !== 200) {
								throw Error(payload.err ?? "");
							}
							if (!payload.desc) {
								throw Error("Generation failed");
							}

							onChange(set(payload.desc ?? ""));
						} catch (error) {
							console.error(error);
						} finally {
							setLoading(false);
						}
					}}
				>
					{!loading ? "Generate" : <Spinner muted />}
				</Button>
			</Card>
		</Stack>
	);
}
