import { getPublishDate } from '@finsweet/ts-utils';
export const greetUser = (name) => {
    const publishDate = getPublishDate();
    console.log(`Hello ${name}!`);
    console.log(`This site was last published on ${publishDate?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    })}.`);
};
