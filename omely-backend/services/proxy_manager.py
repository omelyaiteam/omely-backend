#!/usr/bin/env python3
"""
Proxy Manager Service
Gestion des proxies et techniques anti-détection
"""

import os
import time
import random
import logging
import asyncio
from typing import Dict, Any, Optional, List
import requests
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class ProxyManager:
    def __init__(self):
        self.proxies = []
        self.current_proxy_index = 0
        self.last_rotation = time.time()
        self.rotation_interval = 300  # 5 minutes
        
        # Configuration des proxies (à configurer selon vos besoins)
        self.proxy_config = {
            "enabled": os.getenv("PROXY_ENABLED", "false").lower() == "true",
            "rotation_enabled": os.getenv("PROXY_ROTATION", "true").lower() == "true",
            "test_url": "https://www.youtube.com",
            "timeout": 10
        }
        
        self.status = {
            "proxies_count": 0,
            "active_proxy": None,
            "last_rotation": None,
            "errors_count": 0,
            "requests_count": 0
        }
        
        # Initialisation des proxies
        self._load_proxies()

    def _load_proxies(self):
        """Charge la liste des proxies"""
        try:
            # Proxies depuis les variables d'environnement
            proxy_list = os.getenv("PROXY_LIST", "")
            
            if proxy_list:
                self.proxies = [proxy.strip() for proxy in proxy_list.split(",") if proxy.strip()]
                logger.info(f"📡 {len(self.proxies)} proxies chargés depuis l'environnement")
            
            # Proxies depuis un fichier (optionnel)
            proxy_file = os.getenv("PROXY_FILE", "")
            if proxy_file and os.path.exists(proxy_file):
                with open(proxy_file, 'r') as f:
                    file_proxies = [line.strip() for line in f if line.strip()]
                    self.proxies.extend(file_proxies)
                    logger.info(f"📄 {len(file_proxies)} proxies chargés depuis le fichier")
            
            # Proxies publics gratuits (à utiliser avec précaution)
            if not self.proxies and self.proxy_config["enabled"]:
                self._load_public_proxies()
            
            self.status["proxies_count"] = len(self.proxies)
            
        except Exception as e:
            logger.error(f"Erreur chargement proxies: {e}")

    def _load_public_proxies(self):
        """Charge des proxies publics (à utiliser avec précaution)"""
        try:
            # Liste de proxies publics (exemple)
            public_proxies = [
                # Ajoutez vos proxies publics ici
                # "http://proxy1:port",
                # "http://proxy2:port",
            ]
            
            self.proxies = public_proxies
            logger.warning("⚠️ Utilisation de proxies publics - non recommandé pour la production")
            
        except Exception as e:
            logger.error(f"Erreur chargement proxies publics: {e}")

    def _validate_proxy(self, proxy: str) -> bool:
        """Valide un proxy en testant la connexion"""
        try:
            proxies = {
                "http": proxy,
                "https": proxy
            }
            
            response = requests.get(
                self.proxy_config["test_url"],
                proxies=proxies,
                timeout=self.proxy_config["timeout"],
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.debug(f"Proxy invalide {proxy}: {e}")
            return False

    def _get_next_proxy(self) -> Optional[str]:
        """Retourne le prochain proxy de la rotation"""
        if not self.proxies:
            return None
        
        # Rotation automatique
        if self.proxy_config["rotation_enabled"]:
            current_time = time.time()
            if current_time - self.last_rotation > self.rotation_interval:
                self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxies)
                self.last_rotation = current_time
                self.status["last_rotation"] = current_time
                logger.info(f"🔄 Rotation proxy: {self.proxies[self.current_proxy_index]}")
        
        return self.proxies[self.current_proxy_index]

    def get_proxy_config(self) -> Dict[str, Any]:
        """Retourne la configuration proxy pour yt-dlp"""
        if not self.proxy_config["enabled"] or not self.proxies:
            return {}
        
        proxy = self._get_next_proxy()
        if not proxy:
            return {}
        
        self.status["active_proxy"] = proxy
        self.status["requests_count"] += 1
        
        # Configuration pour yt-dlp
        return {
            "proxy": proxy,
            "source_address": "0.0.0.0",  # Éviter les problèmes de binding
        }

    def get_requests_proxy(self) -> Optional[Dict[str, str]]:
        """Retourne la configuration proxy pour requests"""
        if not self.proxy_config["enabled"] or not self.proxies:
            return None
        
        proxy = self._get_next_proxy()
        if not proxy:
            return None
        
        return {
            "http": proxy,
            "https": proxy
        }

    def test_proxies(self) -> Dict[str, Any]:
        """Teste tous les proxies disponibles"""
        results = {
            "total": len(self.proxies),
            "working": 0,
            "failed": 0,
            "details": []
        }
        
        logger.info(f"🧪 Test de {len(self.proxies)} proxies...")
        
        for i, proxy in enumerate(self.proxies):
            try:
                is_valid = self._validate_proxy(proxy)
                results["details"].append({
                    "proxy": proxy,
                    "status": "working" if is_valid else "failed"
                })
                
                if is_valid:
                    results["working"] += 1
                else:
                    results["failed"] += 1
                    
            except Exception as e:
                results["failed"] += 1
                results["details"].append({
                    "proxy": proxy,
                    "status": "error",
                    "error": str(e)
                })
        
        logger.info(f"✅ Test terminé: {results['working']}/{results['total']} proxies fonctionnels")
        return results

    def add_proxy(self, proxy: str):
        """Ajoute un nouveau proxy"""
        if proxy not in self.proxies:
            self.proxies.append(proxy)
            self.status["proxies_count"] = len(self.proxies)
            logger.info(f"➕ Proxy ajouté: {proxy}")

    def remove_proxy(self, proxy: str):
        """Supprime un proxy"""
        if proxy in self.proxies:
            self.proxies.remove(proxy)
            self.status["proxies_count"] = len(self.proxies)
            logger.info(f"➖ Proxy supprimé: {proxy}")

    def get_anti_detection_headers(self) -> Dict[str, str]:
        """Retourne des headers anti-détection"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
        ]
        
        return {
            "User-Agent": random.choice(user_agents),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Cache-Control": "max-age=0"
        }

    async def health_check(self) -> Dict[str, Any]:
        """Vérification de l'état du service"""
        try:
            return {
                "status": "healthy" if self.proxies else "no_proxies",
                "proxies_count": self.status["proxies_count"],
                "active_proxy": self.status["active_proxy"],
                "enabled": self.proxy_config["enabled"],
                "rotation_enabled": self.proxy_config["rotation_enabled"]
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

    def get_status(self) -> Dict[str, Any]:
        """Retourne le statut du service"""
        return self.status.copy()

    def get_proxy_stats(self) -> Dict[str, Any]:
        """Retourne les statistiques d'utilisation des proxies"""
        return {
            "total_proxies": len(self.proxies),
            "requests_count": self.status["requests_count"],
            "errors_count": self.status["errors_count"],
            "last_rotation": self.status["last_rotation"],
            "rotation_interval": self.rotation_interval
        }
