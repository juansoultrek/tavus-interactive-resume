import { useCallback } from 'react';
import { useDaily } from '@daily-co/daily-react';

export const useCVICall = (): {
	joinCall: (props: { url: string }) => void;
	leaveCall: () => void;
} => {
	const daily = useDaily();

	const joinCall = useCallback(
		({ url }: { url: string }) => {
			if (!daily) return
			void daily.join({ url }).catch((error: unknown) => {
				console.error('Failed to join Tavus Daily room', error)
			})
		},
		[daily]
	)


	const leaveCall = useCallback(() => {
		daily?.leave();
	}, [daily]);

	return { joinCall, leaveCall };
};
