#!/usr/bin/env python3
"""
Temp Cleanup Utility
Gestion automatique du nettoyage des fichiers temporaires
"""

import os
import time
import logging
import asyncio
from typing import List, Optional
from pathlib import Path
import shutil

logger = logging.getLogger(__name__)

class TempCleanup:
    def __init__(self):
        self.temp_dirs = [
            Path("/tmp/omely_audio"),
            Path("/tmp/omely_chunks"),
            Path("/tmp/omely_cache")
        ]
        
        # Configuration du nettoyage
        self.cleanup_config = {
            "auto_cleanup": True,
            "max_age_hours": 24,  # Nettoyer les fichiers de plus de 24h
            "max_size_gb": 10,    # Limite de taille totale en GB
            "cleanup_interval": 3600  # Nettoyage automatique toutes les heures
        }
        
        self.stats = {
            "files_cleaned": 0,
            "bytes_freed": 0,
            "last_cleanup": None,
            "errors_count": 0
        }
        
        # Création des dossiers temporaires
        self._create_temp_dirs()
        
        # Démarrage du nettoyage automatique
        if self.cleanup_config["auto_cleanup"]:
            asyncio.create_task(self._auto_cleanup_loop())

    def _create_temp_dirs(self):
        """Crée les dossiers temporaires nécessaires"""
        for temp_dir in self.temp_dirs:
            try:
                temp_dir.mkdir(parents=True, exist_ok=True)
                logger.debug(f"📁 Dossier temporaire créé: {temp_dir}")
            except Exception as e:
                logger.error(f"Erreur création dossier {temp_dir}: {e}")

    async def cleanup_files(self, file_paths: List[str]):
        """
        Nettoie une liste de fichiers spécifiques
        
        Args:
            file_paths: Liste des chemins de fichiers à supprimer
        """
        cleaned_count = 0
        bytes_freed = 0
        
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    # Calcul de la taille avant suppression
                    file_size = os.path.getsize(file_path)
                    
                    # Suppression du fichier
                    os.remove(file_path)
                    
                    cleaned_count += 1
                    bytes_freed += file_size
                    
                    logger.debug(f"🗑️ Fichier supprimé: {file_path}")
                    
            except Exception as e:
                logger.error(f"Erreur suppression {file_path}: {e}")
                self.stats["errors_count"] += 1
        
        # Mise à jour des statistiques
        self.stats["files_cleaned"] += cleaned_count
        self.stats["bytes_freed"] += bytes_freed
        
        if cleaned_count > 0:
            logger.info(f"🧹 {cleaned_count} fichiers supprimés ({bytes_freed / 1024**2:.2f} MB libérés)")

    async def cleanup_old_files(self, max_age_hours: Optional[int] = None):
        """
        Nettoie les fichiers anciens dans tous les dossiers temporaires
        
        Args:
            max_age_hours: Âge maximum en heures (utilise la config par défaut si None)
        """
        if max_age_hours is None:
            max_age_hours = self.cleanup_config["max_age_hours"]
        
        cutoff_time = time.time() - (max_age_hours * 3600)
        cleaned_count = 0
        bytes_freed = 0
        
        for temp_dir in self.temp_dirs:
            if not temp_dir.exists():
                continue
                
            try:
                for file_path in temp_dir.rglob("*"):
                    if file_path.is_file():
                        # Vérification de l'âge du fichier
                        file_mtime = file_path.stat().st_mtime
                        
                        if file_mtime < cutoff_time:
                            try:
                                file_size = file_path.stat().st_size
                                file_path.unlink()
                                
                                cleaned_count += 1
                                bytes_freed += file_size
                                
                                logger.debug(f"🗑️ Fichier ancien supprimé: {file_path}")
                                
                            except Exception as e:
                                logger.error(f"Erreur suppression {file_path}: {e}")
                                self.stats["errors_count"] += 1
                                
            except Exception as e:
                logger.error(f"Erreur nettoyage dossier {temp_dir}: {e}")
        
        # Mise à jour des statistiques
        self.stats["files_cleaned"] += cleaned_count
        self.stats["bytes_freed"] += bytes_freed
        self.stats["last_cleanup"] = time.time()
        
        if cleaned_count > 0:
            logger.info(f"🧹 Nettoyage automatique: {cleaned_count} fichiers anciens supprimés ({bytes_freed / 1024**2:.2f} MB libérés)")

    async def cleanup_by_size(self, max_size_gb: Optional[int] = None):
        """
        Nettoie les fichiers en fonction de la taille totale
        
        Args:
            max_size_gb: Taille maximale en GB (utilise la config par défaut si None)
        """
        if max_size_gb is None:
            max_size_gb = self.cleanup_config["max_size_gb"]
        
        max_size_bytes = max_size_gb * 1024**3
        current_size = 0
        file_info = []
        
        # Calcul de la taille actuelle et collecte des infos des fichiers
        for temp_dir in self.temp_dirs:
            if not temp_dir.exists():
                continue
                
            try:
                for file_path in temp_dir.rglob("*"):
                    if file_path.is_file():
                        file_size = file_path.stat().st_size
                        file_mtime = file_path.stat().st_mtime
                        
                        current_size += file_size
                        file_info.append({
                            "path": file_path,
                            "size": file_size,
                            "mtime": file_mtime
                        })
                        
            except Exception as e:
                logger.error(f"Erreur scan dossier {temp_dir}: {e}")
        
        # Si la taille dépasse la limite, supprimer les fichiers les plus anciens
        if current_size > max_size_bytes:
            # Tri par date de modification (plus anciens en premier)
            file_info.sort(key=lambda x: x["mtime"])
            
            bytes_to_free = current_size - max_size_bytes
            bytes_freed = 0
            cleaned_count = 0
            
            for file_data in file_info:
                if bytes_freed >= bytes_to_free:
                    break
                    
                try:
                    file_data["path"].unlink()
                    bytes_freed += file_data["size"]
                    cleaned_count += 1
                    
                    logger.debug(f"🗑️ Fichier supprimé (limite taille): {file_data['path']}")
                    
                except Exception as e:
                    logger.error(f"Erreur suppression {file_data['path']}: {e}")
                    self.stats["errors_count"] += 1
            
            # Mise à jour des statistiques
            self.stats["files_cleaned"] += cleaned_count
            self.stats["bytes_freed"] += bytes_freed
            
            if cleaned_count > 0:
                logger.info(f"🧹 Nettoyage par taille: {cleaned_count} fichiers supprimés ({bytes_freed / 1024**2:.2f} MB libérés)")

    async def _auto_cleanup_loop(self):
        """Boucle de nettoyage automatique"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_config["cleanup_interval"])
                
                # Nettoyage des fichiers anciens
                await self.cleanup_old_files()
                
                # Nettoyage par taille
                await self.cleanup_by_size()
                
            except Exception as e:
                logger.error(f"Erreur nettoyage automatique: {e}")
                self.stats["errors_count"] += 1

    def get_temp_files_count(self) -> int:
        """Retourne le nombre de fichiers temporaires"""
        total_count = 0
        
        for temp_dir in self.temp_dirs:
            if temp_dir.exists():
                try:
                    count = len(list(temp_dir.rglob("*")))
                    total_count += count
                except Exception as e:
                    logger.error(f"Erreur comptage fichiers {temp_dir}: {e}")
        
        return total_count

    def get_temp_size(self) -> int:
        """Retourne la taille totale des fichiers temporaires en bytes"""
        total_size = 0
        
        for temp_dir in self.temp_dirs:
            if temp_dir.exists():
                try:
                    for file_path in temp_dir.rglob("*"):
                        if file_path.is_file():
                            total_size += file_path.stat().st_size
                except Exception as e:
                    logger.error(f"Erreur calcul taille {temp_dir}: {e}")
        
        return total_size

    def get_cleanup_stats(self) -> dict:
        """Retourne les statistiques de nettoyage"""
        return {
            "files_cleaned": self.stats["files_cleaned"],
            "bytes_freed_mb": self.stats["bytes_freed"] / 1024**2,
            "bytes_freed_gb": self.stats["bytes_freed"] / 1024**3,
            "last_cleanup": self.stats["last_cleanup"],
            "errors_count": self.stats["errors_count"],
            "current_temp_files": self.get_temp_files_count(),
            "current_temp_size_mb": self.get_temp_size() / 1024**2
        }

    def force_cleanup(self):
        """Force un nettoyage complet de tous les dossiers temporaires"""
        logger.warning("🧹 Nettoyage forcé de tous les dossiers temporaires")
        
        for temp_dir in self.temp_dirs:
            if temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir)
                    temp_dir.mkdir(parents=True, exist_ok=True)
                    logger.info(f"🗑️ Dossier nettoyé: {temp_dir}")
                except Exception as e:
                    logger.error(f"Erreur nettoyage forcé {temp_dir}: {e}")

    def cleanup_on_exit(self):
        """Nettoyage lors de l'arrêt de l'application"""
        logger.info("🧹 Nettoyage final avant arrêt...")
        self.force_cleanup()
