import { motion } from 'framer-motion';

export default function LoadingScreen({ progress }: { progress: number }) {
  return (
    <motion.div
      className="mx-auto flex w-full max-w-sm flex-col items-center px-6 py-20 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <i className="bi bi-soundwave text-[32px] text-brand" aria-hidden="true" />
      <p className="mt-5 text-[15px] text-white">Loading the alphabet…</p>
      <p className="mt-2 text-[13px] text-white/40">Seven tunes, about a megabyte.</p>
      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-brand-grad"
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
