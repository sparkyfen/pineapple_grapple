__author__ = 'Lincoln Turley'
from setuptools import setup

setup(name='pagrapple',
      description='A project for CSE 465 (Information Assurance) to detect MITM attacks.',
      author='Lester Penning, Adam Schodde, Lincoln Turley',
      author_email='aaschodd@asu.edu',
      url='http://www.pagrapple.com/',
      version='1.0',
      py_modules=['main', 'network_info','api'],
      platforms=['Windows', 'iOS', 'Linux'],
      install_requires=['requests', 'netaddr', 'xmltodict', 'colorama', 'netifaces'],
      )