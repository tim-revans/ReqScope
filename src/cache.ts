import * as vscode from "vscode";
import { getSetting } from "./settings";
import { RequirementData } from "./requirement-provider";
import { getContext } from "./context";

type ReqCacheItem = {
  lastUpdated: number;
  data: RequirementData;
};

const cacheName = "ReqScope_cache";
const timeoutSetting = "cacheTimeout";

export function cleanCache() {
  const context = getContext();
  let cache = context.globalState.get<ReqCacheItem[]>(cacheName, []);
  context.globalState.update(
    cacheName,
    cache.filter(
      (element) =>
        Date.now() - (element.lastUpdated ?? 0) <
        getSetting(timeoutSetting) * 1e3,
    ),
  );
}

export function queryCache(id: string): RequirementData | null {
  const context = getContext();
  let cache = context.globalState.get<ReqCacheItem[]>(cacheName, []);
  return cache.find((element) => element.data.id === id)?.data ?? null;
}

export function updateCache(data: RequirementData) {
  const context = getContext();
  let cache = context.globalState.get<ReqCacheItem[]>(cacheName, []);
  cache.push({ data: data, lastUpdated: Date.now() });
}
