-- Remove duplicate metrics from scorecard_metrics table
-- Migration: 20250102000003_remove_duplicate_metrics.sql
-- 
-- This migration removes duplicate metrics that were created when saves failed.
-- Duplicates are identified by having the same role_id and metric_name.
-- For each set of duplicates, we keep the one with:
--   1. Most recent updated_at timestamp
--   2. If tied, most recent created_at timestamp
--   3. If tied, highest id (most recent)
-- And delete the rest.

DO $$
DECLARE
    duplicate_groups INTEGER;
    total_duplicates INTEGER;
    deleted_count INTEGER := 0;
    metric_record RECORD;
    keep_id UUID;
BEGIN
    -- Count duplicate groups first
    SELECT COUNT(*) INTO duplicate_groups
    FROM (
        SELECT role_id, metric_name
        FROM public.scorecard_metrics
        GROUP BY role_id, metric_name
        HAVING COUNT(*) > 1
    ) duplicates;

    IF duplicate_groups = 0 THEN
        RAISE NOTICE 'No duplicate metrics found. Nothing to clean up.';
        RETURN;
    END IF;

    RAISE NOTICE 'Found % groups of duplicate metrics. Starting cleanup...', duplicate_groups;

    -- Find and delete duplicate metrics
    -- For each group of duplicates (same role_id and metric_name),
    -- keep the one with the most recent updated_at (or highest id if updated_at is the same)
    FOR metric_record IN
        SELECT 
            role_id,
            metric_name,
            COUNT(*) as dup_count
        FROM public.scorecard_metrics
        GROUP BY role_id, metric_name
        HAVING COUNT(*) > 1
    LOOP
        -- For this group of duplicates, find the one to keep
        -- (most recent updated_at, then created_at, then highest id)
        SELECT id INTO keep_id
        FROM public.scorecard_metrics
        WHERE role_id = metric_record.role_id
          AND metric_name = metric_record.metric_name
        ORDER BY 
            updated_at DESC NULLS LAST,
            created_at DESC NULLS LAST,
            id DESC
        LIMIT 1;

        -- Delete all duplicates except the one we're keeping
        -- Note: This will cascade delete related weekly_data, metric_scores, etc.
        DELETE FROM public.scorecard_metrics
        WHERE role_id = metric_record.role_id
          AND metric_name = metric_record.metric_name
          AND id != keep_id;

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_duplicates := total_duplicates + deleted_count;
        
        RAISE NOTICE 'Removed % duplicate(s) for role_id: %, metric_name: "%", kept id: %', 
            deleted_count, metric_record.role_id, metric_record.metric_name, keep_id;
    END LOOP;

    RAISE NOTICE 'Total duplicates removed: %', total_duplicates;

    -- Verify cleanup - count remaining duplicates (should be 0)
    SELECT COUNT(*) INTO duplicate_groups
    FROM (
        SELECT role_id, metric_name, COUNT(*) as cnt
        FROM public.scorecard_metrics
        GROUP BY role_id, metric_name
        HAVING COUNT(*) > 1
    ) remaining_duplicates;

    IF duplicate_groups > 0 THEN
        RAISE WARNING 'Still found % groups of duplicates after cleanup. Please review manually.', duplicate_groups;
    ELSE
        RAISE NOTICE 'Successfully removed all duplicate metrics!';
    END IF;
END $$;

-- Optional: Add a unique constraint to prevent future duplicates
-- (Only if it doesn't already exist)
DO $$
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.scorecard_metrics'::regclass
        AND conname = 'scorecard_metrics_role_metric_unique'
    ) THEN
        -- Add unique constraint to prevent future duplicates
        ALTER TABLE public.scorecard_metrics
        ADD CONSTRAINT scorecard_metrics_role_metric_unique
        UNIQUE (role_id, metric_name);
        
        RAISE NOTICE 'Added unique constraint on (role_id, metric_name) to prevent future duplicates';
    ELSE
        RAISE NOTICE 'Unique constraint already exists, skipping';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Could not add unique constraint: %', SQLERRM;
END $$;

