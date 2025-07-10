import type { AppProps } from 'next/app'
import {HeroUIProvider} from "@heroui/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import '../app/globals.css'; // Import global styles

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <HeroUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="light">
                <Component {...pageProps} />
            </NextThemesProvider>
        </HeroUIProvider>
    )
}

export default MyApp;